import os
from pathlib import Path

from langchain_community.document_loaders import PyPDFDirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

SCRIPT_DIR = Path(__file__).resolve().parent
KB_DIR = SCRIPT_DIR.parent / "datasets"
INDEX_DIR = SCRIPT_DIR.parent / "train_results"
INDEX_DIR.mkdir(parents=True, exist_ok=True)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)


async def build_knowledge_base() -> bool:
    if not KB_DIR.exists():
        return False

    docs = []
    pdf_files = list(KB_DIR.glob("*.pdf"))
    txt_files = list(KB_DIR.glob("*.txt"))

    if pdf_files:
        loader = PyPDFDirectoryLoader(str(KB_DIR))
        docs.extend(loader.load())

    for txt_path in txt_files:
        loader = TextLoader(str(txt_path))
        docs.extend(loader.load())

    if not docs:
        return False

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    vectorstore = FAISS.from_documents(documents=splits, embedding=embeddings)
    vectorstore.save_local(str(INDEX_DIR), index_name="hermes_rag")
    return True


async def search_knowledge_base(query: str, k: int = 3) -> str:
    index_path = INDEX_DIR / "hermes_rag.faiss"
    if not index_path.exists():
        built = await build_knowledge_base()
        if not built:
            return "Knowledge base not initialized. Add PDF/TXT files to the datasets folder."

    vectorstore = FAISS.load_local(
        folder_path=str(INDEX_DIR),
        embeddings=embeddings,
        index_name="hermes_rag",
        allow_dangerous_deserialization=True,
    )
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    docs = retriever.invoke(query)
    if not docs:
        return "No relevant documents found."
    results = "\n\n".join(
        f"--- Source ---\n{doc.page_content}" for doc in docs
    )
    return results

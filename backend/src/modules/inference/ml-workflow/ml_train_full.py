"""
Treinamento YOLOv8 completo com checkpoint automático e melhor modelo.
Baseado na técnica EpiScope: checkpoint, best model, logging.

Uso:
    python -m modules.inference.ml-workflow.ml_train_full
"""

from __future__ import annotations

import json
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

import yaml

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
DATASET_DIR = BASE_DIR / "datasets" / "architecture_merged"
MODELS_DIR = BASE_DIR / "models" / "architecture_yolo"
FINAL_MODEL_DIR = BASE_DIR / "backend" / "src" / "modules" / "inference" / "train_results"

DATASET_YAML = DATASET_DIR / "dataset.yaml"
EPOCHS = 10

def _detect_device() -> str:
    try:
        import torch_directml
        import torch
        dml = torch_directml.device()
        torch.randn(1).to(dml)
        print(f"GPU DirectML detectada: {torch_directml.device_name(0)}")
        return "cpu"
    except:
        return "cpu"

def _patch_directml():
    try:
        import torch_directml
        import torch
        dml = torch_directml.device()
        torch.randn(1).to(dml)
        print(f"Usando GPU: {torch_directml.device_name(0)}")
        torch.cuda.is_available = lambda: True
        torch.cuda.device_count = lambda: 1
    except:
        print("GPU nao disponivel, usando CPU")
BATCH = 16
IMGSZ = 640
PATIENCE = 30

PROGRESS_FILE = MODELS_DIR / "training_progress.json"


def log_progress(pct: float, status: str, message: str = ""):
    try:
        MODELS_DIR.mkdir(parents=True, exist_ok=True)
        with open(PROGRESS_FILE, "w") as f:
            json.dump({"pct": pct, "status": status, "message": message, "timestamp": datetime.now().isoformat()}, f)
    except:
        pass


def _fix_yaml_path():
    if not DATASET_YAML.exists():
        return
    import yaml
    with open(DATASET_YAML) as f:
        data = yaml.safe_load(f)
    if data and "path" in data and "C:" in str(data["path"]):
        win = str(data["path"])
        wsl = win.replace("C:\\Users\\root_\\Documents\\bisnet0-GitHub", "/mnt/c/Users/root_/Documents/bisnet0-GitHub").replace("\\", "/")
        data["path"] = wsl
        with open(DATASET_YAML, "w") as f:
            yaml.dump(data, f)
        print(f"YAML path corrigido: {win} -> {wsl}")


def train():
    _fix_yaml_path()
    if not DATASET_YAML.exists():
        print(f"ERRO: Dataset não encontrado em {DATASET_YAML}")
        sys.exit(1)

    with open(DATASET_YAML) as f:
        meta = yaml.safe_load(f)
    nc = meta.get("nc", 0)
    names = meta.get("names", [])
    print(f"Dataset: {DATASET_YAML}")
    print(f"  Classes: {nc} -> {names}")
    train_count = len(list((DATASET_DIR / "train" / "images").glob("*")))
    val_count = len(list((DATASET_DIR / "valid" / "images").glob("*")))
    print(f"  Imagens: {train_count} treino | {val_count} validação")
    print(f"  Épocas: {EPOCHS} | Batch: {BATCH} | Imgsz: {IMGSZ}")
    print()

    import warnings
    warnings.filterwarnings("ignore", message=".*pin_memory.*")
    import torch.utils.data._utils.pin_memory as pm
    pm.pin_memory = lambda data, device=None: data
    _patch_directml()

    from ultralytics import YOLO

    log_progress(0, "loading", "Carregando modelo base...")
    model = YOLO("yolov8n.pt")
    model.info()

    print(f"\nIniciando treinamento em {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    log_progress(5, "training", "Treinando...")
    start_total = time.time()

    resume_path = MODELS_DIR / "weights" / "last.pt"
    if resume_path.exists():
        print(f"Checkpoint encontrado! Retomando de: {resume_path}")
        model = YOLO(str(resume_path))

    results = model.train(
        data=str(DATASET_YAML),
        epochs=EPOCHS,
        imgsz=IMGSZ,
        batch=BATCH,
        patience=PATIENCE,
        project=str(MODELS_DIR),
        name=".",
        exist_ok=True,
        resume=resume_path.exists(),
        device=_detect_device(),
        workers=2,
        lr0=0.01,
        lrf=0.01,
        warmup_epochs=0 if resume_path.exists() else 3,
        save=True,
        save_period=10,
    )

    total_time = time.time() - start_total
    hours, rem = divmod(total_time, 3600)
    minutes, seconds = divmod(rem, 60)

    best_pt = MODELS_DIR / "weights" / "best.pt"
    last_pt = MODELS_DIR / "weights" / "last.pt"

    metrics = results.results_dict if hasattr(results, "results_dict") else {}
    map50 = metrics.get("mAP50", 0)

    print()
    print("=" * 60)
    print(f"TREINAMENTO CONCLUÍDO em {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Tempo total: {int(hours)}h {int(minutes)}m {int(seconds)}s")
    print(f"Melhor mAP@0.5: {map50:.4f}")

    if best_pt.exists():
        print(f"Modelo best: {best_pt}")
        print(f"Modelo last: {last_pt}")

        FINAL_MODEL_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copy(str(best_pt), str(FINAL_MODEL_DIR / "best.pt"))
        print(f"Copiado para: {FINAL_MODEL_DIR / 'best.pt'}")
        print("Agora o container usará este modelo nas inferências.")

    log_progress(100, "completed", f"mAP50: {map50:.4f}")
    print("\nPronto!")


if __name__ == "__main__":
    train()

"""
YOLOv8 Training Script — Architecture Diagram Component Detection
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Callable, Dict, Optional

import yaml
from ultralytics import YOLO

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
MERGED_DATASET_DIR = BASE_DIR / "datasets" / "architecture_merged"
EXCALIDRAW_DIR = BASE_DIR / "datasets" / "excalidraw_system_design"
TRAIN_RESULTS_DIR = Path(__file__).resolve().parent.parent / "train_results"
TRAIN_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

_progress_file: Optional[str] = None


def _progress_callback(log_id: str, stage: str, message: str, pct: float = 0):
    global _progress_file
    if _progress_file is None:
        _progress_file = str(TRAIN_RESULTS_DIR / f"progress_{log_id}.json")
    try:
        with open(_progress_file, "w") as f:
            json.dump({"stage": stage, "message": message, "pct": pct}, f)
    except:
        pass


async def export_dataset_to_yolo(
    output_dir: str,
    val_split: float = 0.2,
) -> str:
    if MERGED_DATASET_DIR.exists() and (MERGED_DATASET_DIR / "dataset.yaml").exists():
        src_yaml = MERGED_DATASET_DIR / "dataset.yaml"
        with open(src_yaml) as f:
            meta = yaml.safe_load(f)
        names = meta.get("names", [])
        nc = len(names)

        for split in ["train", "valid"]:
            src_img = MERGED_DATASET_DIR / split / "images"
            src_lbl = MERGED_DATASET_DIR / split / "labels"
            dst_img = Path(output_dir) / split / "images"
            dst_lbl = Path(output_dir) / split / "labels"
            dst_img.mkdir(parents=True, exist_ok=True)
            dst_lbl.mkdir(parents=True, exist_ok=True)
            if src_img.exists():
                for f in src_img.iterdir():
                    shutil.copy(f, dst_img / f.name)
                for f in src_lbl.iterdir():
                    shutil.copy(f, dst_lbl / f.name)

        if EXCALIDRAW_DIR.exists():
            excalidraw_yaml = EXCALIDRAW_DIR / "dataset.yaml"
            if excalidraw_yaml.exists():
                with open(excalidraw_yaml) as f:
                    exc_meta = yaml.safe_load(f)
                exc_names = exc_meta.get("names", [])
                for ename in exc_names:
                    if ename not in names:
                        names.append(ename)
                        nc = len(names)
                for split in ["train", "valid"]:
                    src_img = EXCALIDRAW_DIR / split / "images"
                    src_lbl = EXCALIDRAW_DIR / split / "labels"
                    dst_img = Path(output_dir) / split / "images"
                    dst_lbl = Path(output_dir) / split / "labels"
                    if src_img.exists():
                        for f in src_img.iterdir():
                            shutil.copy(f, dst_img / f.name)
                    if src_lbl.exists():
                        for f in src_lbl.iterdir():
                            shutil.copy(f, dst_lbl / f.name)

        data_yaml = {
            "path": output_dir,
            "train": "train",
            "val": "valid",
            "nc": nc,
            "names": names,
        }
    else:
        data_yaml = {
            "path": output_dir,
            "train": "train",
            "val": "val",
            "nc": len(COMPONENT_CLASSES),
            "names": COMPONENT_CLASSES,
        }
        for split in ["train", "val"]:
            (Path(output_dir) / split / "images").mkdir(parents=True)
            (Path(output_dir) / split / "labels").mkdir(parents=True)

    yaml_path = os.path.join(output_dir, "dataset.yaml")
    with open(yaml_path, "w") as f:
        yaml.dump(data_yaml, f)

    return yaml_path


async def train_yolo(
    dataset_yaml: str,
    model_name: str = "yolov8n.pt",
    epochs: int = 100,
    imgsz: int = 640,
    batch: int = 16,
    patience: int = 20,
    log_id: str = "",
    progress_callback: Optional[Callable] = None,
) -> Dict:
    cb = progress_callback or (lambda s, m, p: _progress_callback(log_id, s, m, p))

    cb("loading", "Carregando modelo base...", 0)
    model = YOLO(model_name)
    cb("preparing", "Preparando dataset...", 5)

    cb("training", "Iniciando treinamento...", 10)
    results = model.train(
        data=dataset_yaml,
        epochs=epochs,
        imgsz=imgsz,
        batch=batch,
        patience=patience,
        project=str(TRAIN_RESULTS_DIR),
        name="architecture_yolo",
        exist_ok=True,
        device="cpu",
    )
    cb("finalizing", "Finalizando modelo...", 95)

    best_model_path = str(TRAIN_RESULTS_DIR / "architecture_yolo" / "weights" / "best.pt")
    final_model_path = str(TRAIN_RESULTS_DIR / "architecture_yolo" / "weights" / "last.pt")

    metrics = results.results_dict if hasattr(results, "results_dict") else {}

    cb("done", "Treinamento concluído!", 100)

    return {
        "best_model_path": best_model_path,
        "final_model_path": final_model_path,
        "metrics": metrics,
    }


if __name__ == "__main__":
    import asyncio

    async def main():
        from config.database import init_database
        from config.settings import get_settings

        settings = get_settings()
        await init_database(settings.database_url)

        with tempfile.TemporaryDirectory() as tmpdir:
            print("Exporting dataset...")
            yaml_path = await export_dataset_to_yolo(tmpdir)
            print(f"Dataset exported to {yaml_path}")

            print("Starting training...")
            result = await train_yolo(yaml_path)
            print(f"Training complete: {result}")

    asyncio.run(main())

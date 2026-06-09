"""
YOLOv8 Training Script — Architecture Diagram Component Detection

Usage:
    python -m modules.inference.ml-workflow.ml_train_yolo

This script:
1. Exports dataset from MongoDB to YOLO format
2. Fine-tunes YOLOv8 on architecture diagrams
3. Saves the best model weights to train_results/
"""

from __future__ import annotations

import os
import tempfile
import zipfile
from pathlib import Path
from typing import Dict, List

import yaml
from beanie.odm.operators.find.comparison import In
from ultralytics import YOLO

TRAIN_RESULTS_DIR = Path(__file__).resolve().parent.parent / "train_results"
TRAIN_RESULTS_DIR.mkdir(parents=True, exist_ok=True)

COMPONENT_CLASSES = [
    "user", "server", "database", "api", "load_balancer",
    "firewall", "message_queue", "cache", "cdn", "dns",
    "microservice", "gateway", "storage", "container", "identity_provider",
]


async def export_dataset_to_yolo(
    output_dir: str,
    val_split: float = 0.2,
) -> str:
    from modules.inference.models.inference_model import InferenceResult

    results = await InferenceResult.find(
        InferenceResult.status == "completed"
    ).to_list()

    train_dir = os.path.join(output_dir, "train")
    val_dir = os.path.join(output_dir, "val")

    for split_dir in [os.path.join(train_dir, "images"),
                       os.path.join(train_dir, "labels"),
                       os.path.join(val_dir, "images"),
                       os.path.join(val_dir, "labels")]:
        os.makedirs(split_dir, exist_ok=True)

    for i, result in enumerate(results):
        split = "val" if i < int(len(results) * val_split) else "train"
        img_dir = os.path.join(output_dir, split, "images")
        lbl_dir = os.path.join(output_dir, split, "labels")

        img_path = result.image_path
        if not os.path.exists(img_path):
            continue

        import shutil
        shutil.copy(img_path, os.path.join(img_dir, f"{result.id}.png"))

        label_lines = []
        for comp in result.components:
            x, y, w, h = comp["bbox"]
            img_w, img_h = 640, 640
            x_center = (x + w / 2) / img_w
            y_center = (y + h / 2) / img_h
            norm_w = w / img_w
            norm_h = h / img_h
            label_lines.append(
                f"{comp['class_id']} {x_center:.6f} {y_center:.6f} {norm_w:.6f} {norm_h:.6f}"
            )

        with open(os.path.join(lbl_dir, f"{result.id}.txt"), "w") as f:
            f.write("\n".join(label_lines))

    data_yaml = {
        "path": output_dir,
        "train": "train",
        "val": "val",
        "nc": len(COMPONENT_CLASSES),
        "names": COMPONENT_CLASSES,
    }

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
) -> Dict:
    model = YOLO(model_name)

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

    best_model_path = str(TRAIN_RESULTS_DIR / "architecture_yolo" / "weights" / "best.pt")
    final_model_path = str(TRAIN_RESULTS_DIR / "architecture_yolo" / "weights" / "last.pt")

    metrics = results.results_dict if hasattr(results, "results_dict") else {}

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

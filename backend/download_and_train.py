"""
Script autônomo para baixar datasets do Roboflow, mesclar e treinar YOLOv8.

Uso:
    pip install roboflow ultralytics pyyaml
    python download_and_train.py

Os datasets baixados vão para: datasets/roboflow_raw/
O merged vai para:            datasets/architecture_merged/
O modelo treinado vai para:   models/architecture_yolo/
"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

import yaml

API_KEY = "t8Ww1jdgyzZycgsBirPR"

ROBOFLOW_DATASETS = [
    {"workspace": "project-v2jjh", "project": "network-topology-diagram", "version": 1},
    {"workspace": "class-diagram-dataset", "project": "class-diagram-detection-covx5", "version": 6},
    {"workspace": "uml-yoxue", "project": "uml-diagram-ml", "version": 5},
    {"workspace": "train-ai-2d5az", "project": "diagram-detection-8ewyo", "version": 8},
    {"workspace": "diagram-automation", "project": "diagram-automation-2", "version": 10},
    {"workspace": "bot-interactivo-tesis", "project": "code-vs-diagram", "version": 1},
    {"workspace": "class-diagram-labeling", "project": "class-diagram-inheritance", "version": 1},
]

BASE_DIR = Path(__file__).resolve().parent
DOWNLOADS_DIR = BASE_DIR / "datasets" / "roboflow_raw"
MERGED_DIR = BASE_DIR / "datasets" / "architecture_merged"
MODELS_DIR = BASE_DIR / "models"


def step1_download_all():
    from roboflow import Roboflow

    rf = Roboflow(api_key=API_KEY)

    for ds in ROBOFLOW_DATASETS:
        dest = DOWNLOADS_DIR / f"{ds['workspace']}_{ds['project']}"
        if dest.exists():
            print(f"  ja existe: {dest.name}")
            continue
        print(f"  baixando: {ds['workspace']}/{ds['project']} v{ds['version']} ...")
        project = rf.workspace(ds["workspace"]).project(ds["project"])
        version = project.version(ds["version"])
        version.download("yolov8", location=str(dest))
        print(f"    ok -> {dest}")


def step2_merge():
    if MERGED_DIR.exists():
        shutil.rmtree(MERGED_DIR)

    for split in ["train", "valid"]:
        (MERGED_DIR / split / "images").mkdir(parents=True)
        (MERGED_DIR / split / "labels").mkdir(parents=True)

    merged_names = []
    class_mapping = {}
    next_class_id = 0
    image_counter = 0

    raw_dirs = sorted(DOWNLOADS_DIR.iterdir()) if DOWNLOADS_DIR.exists() else []
    if not raw_dirs:
        print("Nenhum dataset baixado. Execute step1 primeiro.")
        return

    for ds_dir in raw_dirs:
        if not ds_dir.is_dir():
            continue

        data_yaml_path = ds_dir / "data.yaml"
        if not data_yaml_path.exists():
            continue

        with open(data_yaml_path) as f:
            meta = yaml.safe_load(f)
        names = meta.get("names", [])

        local_mapping = {}
        for class_name in names:
            if class_name not in class_mapping:
                class_mapping[class_name] = next_class_id
                merged_names.append(class_name)
                next_class_id += 1
            local_mapping[class_name] = class_mapping[class_name]

        print(f"Mesclando: {ds_dir.name} ({len(names)} classes)")

        for split in ["train", "valid"]:
            img_dir = ds_dir / split / "images"
            lbl_dir = ds_dir / split / "labels"

            if not img_dir.exists():
                continue

            for img_path in img_dir.glob("*"):
                if img_path.suffix.lower() not in (".png", ".jpg", ".jpeg"):
                    continue

                target_split = "train" if split == "train" else "valid"
                new_name = f"img_{image_counter:06d}{img_path.suffix}"
                shutil.copy(img_path, MERGED_DIR / target_split / "images" / new_name)

                label_path = lbl_dir / f"{img_path.stem}.txt"
                if label_path.exists():
                    new_lines = []
                    with open(label_path) as f:
                        for line in f:
                            parts = line.strip().split()
                            if len(parts) >= 5:
                                orig_class = int(parts[0])
                                if orig_class < len(names):
                                    new_class = local_mapping[names[orig_class]]
                                    parts[0] = str(new_class)
                                    new_lines.append(" ".join(parts))

                    if new_lines:
                        lbl_path = MERGED_DIR / target_split / "labels" / f"img_{image_counter:06d}.txt"
                        with open(lbl_path, "w") as f:
                            f.write("\n".join(new_lines) + "\n")

                image_counter += 1

    data_yaml = {
        "path": str(MERGED_DIR),
        "train": "train",
        "val": "valid",
        "nc": len(merged_names),
        "names": merged_names,
    }

    yaml_path = MERGED_DIR / "dataset.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(data_yaml, f)

    print(f"\nMerge concluido!")
    print(f"  Total imagens: {image_counter}")
    print(f"  Total classes: {len(merged_names)}")
    print(f"  Classes: {merged_names}")
    print(f"  Dataset YAML: {yaml_path}")

    return str(yaml_path)


def step3_train(dataset_yaml: str):
    from ultralytics import YOLO

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    model = YOLO("yolov8n.pt")
    results = model.train(
        data=dataset_yaml,
        epochs=100,
        imgsz=640,
        batch=16,
        patience=20,
        project=str(MODELS_DIR),
        name="architecture_yolo",
        exist_ok=True,
        device="cpu",
    )

    best = MODELS_DIR / "architecture_yolo" / "weights" / "best.pt"
    print(f"\nTreinamento concluido!")
    print(f"  Modelo salvo em: {best}")

    return str(best)


if __name__ == "__main__":
    print("=" * 60)
    print("  RiftShield — Download + Merge + Treinamento YOLOv8")
    print("=" * 60)

    print("\n[1/3] Baixando datasets do Roboflow...")
    step1_download_all()

    print("\n[2/3] Mesclando datasets...")
    yaml_path = step2_merge()
    if not yaml_path:
        exit(1)

    print(f"\n[3/3] Iniciando treinamento YOLOv8...")
    print(f"    Dataset: {yaml_path}")
    print(f"    Modelo base: yolov8n.pt")
    print(f"    Epocas: 100")
    step3_train(yaml_path)

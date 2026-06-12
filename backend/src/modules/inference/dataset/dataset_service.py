from __future__ import annotations

import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from modules.inference.dataset.dataset_model import ComponentLabel, DatasetEntry

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
DATASET_DIR = UPLOAD_DIR / "dataset"
DATASET_DIR.mkdir(parents=True, exist_ok=True)

COMPONENT_CLASSES = [
    "user", "server", "database", "api", "load_balancer",
    "firewall", "message_queue", "cache", "cdn", "dns",
    "microservice", "gateway", "storage", "container", "identity_provider",
]


async def upload_entry(
    image_data: bytes,
    filename: str,
    labels: List[dict],
    user_id: str,
    split: str = "train",
    image_width: int = 640,
    image_height: int = 640,
) -> DatasetEntry:
    file_id = uuid.uuid4().hex[:12]
    safe_name = f"{file_id}_{filename}"
    file_path = DATASET_DIR / safe_name

    with open(file_path, "wb") as f:
        f.write(image_data)

    component_labels = []
    for lbl in labels:
        component_labels.append(
            ComponentLabel(
                class_id=lbl["class_id"],
                label=lbl.get("label", COMPONENT_CLASSES[lbl["class_id"]] if lbl["class_id"] < len(COMPONENT_CLASSES) else f"unknown_{lbl['class_id']}"),
                x_center=lbl["x_center"],
                y_center=lbl["y_center"],
                width=lbl["width"],
                height=lbl["height"],
            )
        )

    entry = DatasetEntry(
        user_id=user_id,
        filename=safe_name,
        image_path=str(file_path),
        labels=component_labels,
        source="manual",
        split=split,
        image_width=image_width,
        image_height=image_height,
    )
    await entry.insert()
    return entry


async def list_entries(
    split: Optional[str] = None,
    source: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
) -> Tuple[List[DatasetEntry], int]:
    query: Dict = {}
    if split:
        query["split"] = split
    if source:
        query["source"] = source
    if user_id:
        query["user_id"] = user_id

    total = await DatasetEntry.find(query).count()
    items = (
        await DatasetEntry.find(query)
        .sort(-DatasetEntry.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    return items, total


async def get_entry(entry_id: str) -> Optional[DatasetEntry]:
    return await DatasetEntry.get(entry_id)


async def delete_entry(entry_id: str) -> bool:
    entry = await DatasetEntry.get(entry_id)
    if not entry:
        return False
    if entry.image_path and os.path.exists(entry.image_path):
        os.remove(entry.image_path)
    await entry.delete()
    return True


async def get_stats() -> dict:
    total = await DatasetEntry.find({}).count()
    train_count = await DatasetEntry.find({"split": "train"}).count()
    val_count = await DatasetEntry.find({"split": "val"}).count()
    test_count = await DatasetEntry.find({"split": "test"}).count()
    manual_count = await DatasetEntry.find({"source": "manual"}).count()
    augmented_count = await DatasetEntry.find({"source": "augmented"}).count()

    label_distribution: Dict[str, int] = {c: 0 for c in COMPONENT_CLASSES}
    cursor = DatasetEntry.find({})
    async for entry in cursor:
        for lbl in entry.labels:
            label_distribution[lbl.label] = label_distribution.get(lbl.label, 0) + 1

    return {
        "total": total,
        "train_count": train_count,
        "val_count": val_count,
        "test_count": test_count,
        "manual_count": manual_count,
        "augmented_count": augmented_count,
        "label_distribution": label_distribution,
    }


async def augment_entry(entry_id: str) -> List[DatasetEntry]:
    entry = await DatasetEntry.get(entry_id)
    if not entry:
        return []

    augmented: List[DatasetEntry] = []
    import copy

    transforms = [
        ("hflip", lambda c: _flip_horizontal(c, entry.image_width)),
        ("vflip", lambda c: _flip_vertical(c, entry.image_height)),
        ("brightness", lambda c: c),
    ]

    for aug_name, transform_fn in transforms:
        new_labels = [transform_fn(copy.deepcopy(lbl)) for lbl in entry.labels]
        aug_entry = DatasetEntry(
            user_id=entry.user_id,
            filename=f"{aug_name}_{entry.filename}",
            image_path=entry.image_path,
            labels=new_labels,
            source="augmented",
            split=entry.split,
            augmented=True,
            original_entry_id=entry_id,
            image_width=entry.image_width,
            image_height=entry.image_height,
        )
        await aug_entry.insert()
        augmented.append(aug_entry)

    return augmented


def _flip_horizontal(label: ComponentLabel, img_w: int) -> ComponentLabel:
    label.x_center = 1.0 - label.x_center
    return label


def _flip_vertical(label: ComponentLabel, img_h: int) -> ComponentLabel:
    label.y_center = 1.0 - label.y_center
    return label

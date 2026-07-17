import yaml
p = r"C:\Users\root_\Documents\bisnet0-GitHub\RiftShield\backend\models\architecture_yolo\args.yaml"
try:
    with open(p) as f:
        d = yaml.safe_load(f)
    d["epochs"] = 10
    with open(p, "w") as f:
        yaml.dump(d, f)
    print(f"args.yaml epochs set to 10 (was {d.get('epochs', 'unknown')})")
except FileNotFoundError:
    print("args.yaml not found at", p)

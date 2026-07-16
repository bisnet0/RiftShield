from __future__ import annotations

from modules.attack.services import attack_service


async def simulate(data: dict, user_id: str) -> dict:
    attack_type = data.get("type", "ddos")
    target = data.get("target", "server")
    result = await attack_service.simulate_attack(attack_type, target, user_id)
    return {
        "id": str(result.id),
        "attack_type": result.attack_type,
        "target_component": result.target_component,
        "severity": result.severity,
        "description": result.description,
        "technical_details": result.technical_details,
        "countermeasures": result.countermeasures,
    }


async def list_simulations(user_id: str) -> dict:
    items, total = await attack_service.list_simulations(user_id)
    return {
        "total": total,
        "items": [
            {
                "id": str(i.id),
                "attack_type": i.attack_type,
                "target_component": i.target_component,
                "severity": i.severity,
                "description": i.description,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in items
        ],
    }

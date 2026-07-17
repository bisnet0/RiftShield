from __future__ import annotations

from modules.export.services import export_service


async def export(data: dict, user_id: str) -> dict:
    sections = data.get("sections", ["inferences", "threats", "vulnerabilities"])
    include_profile = data.get("include_profile", False)
    include_settings = data.get("include_settings", False)
    fmt = data.get("format", "json")
    zip_output = data.get("zip", False)
    lang = data.get("lang", "pt-BR")
    result = await export_service.export_data(
        user_id=user_id,
        sections=sections,
        include_profile=include_profile,
        include_settings=include_settings,
        fmt=fmt,
        zip_output=zip_output,
        lang=lang,
    )
    return result

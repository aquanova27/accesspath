from app.models import UserNeedsProfile, Facility, MatchResult

def calculate_match(user: UserNeedsProfile, facility: Facility) -> MatchResult:
    total_checks = 0
    passed_checks = 0
    matched = []
    missing = []

    checks = [
        ("Wheelchair Access", user.requires_wheelchair, facility.wheelchair_accessible),
        ("Bariatric Equipment", user.requires_bariatric_equipment, facility.bariatric_equipped),
        ("ASL Interpretation", user.requires_asl, facility.asl_interpreter_available),
        ("Tactile Signage", user.requires_tactile_signage, facility.tactile_signage),
        ("Low-Stimulus Environment", user.requires_low_stimulus, facility.sensory_room_available),
        ("Strobe-Free Lighting", user.requires_strobe_free, facility.strobe_free_lighting),
    ]

    for label, required, supported in checks:
        if required:
            total_checks += 1
            if supported:
                passed_checks += 1
                matched.append(f"Supports {label}")
            else:
                missing.append(f"Does not support {label}")

    # If user selected no specific filters, give baseline 100%
    if total_checks == 0:
        score = 100.0
        recommendations = "General facility match based on standard access protocols."
    else:
        score = round((passed_checks / total_checks) * 100.0, 1)
        if score == 100.0:
            recommendations = "All specified accommodation requirements are fully met by this facility."
        elif score >= 50.0:
            recommendations = "Partial match. Some specific accessibility requirements are met; contact front desk for contingencies."
        else:
            recommendations = "Significant accessibility gaps identified for your profile."

    return MatchResult(
        facility=facility,
        universal_access_score=score,
        matched_criteria=matched,
        missing_criteria=missing,
        recommendation_notes=recommendations
    )
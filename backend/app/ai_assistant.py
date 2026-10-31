from app.models import UserNeedsProfile, Facility

def generate_pre_visit_request(user: UserNeedsProfile, facility: Facility) -> str:
    needs_list = []
    if user.requires_wheelchair: needs_list.append("- Wheelchair transfer assistance and accessible exam table")
    if user.requires_bariatric_equipment: needs_list.append("- Bariatric-rated equipment and seating")
    if user.requires_asl: needs_list.append("- Certified ASL interpreter present for consultation")
    if user.requires_tactile_signage: needs_list.append("- Tactile/Braille directional support")
    if user.requires_low_stimulus: needs_list.append("- Low-stimulus waiting area assignment")
    if user.requires_strobe_free: needs_list.append("- Strobe-free environment verification")

    needs_str = "\n".join(needs_list) if needs_list else "- Standard accessibility accommodations"

    return f"""
FORMAL PRE-VISIT ACCOMMODATION REQUEST
To: Patient Services / Front Desk, {facility.name}
Facility Address: {facility.address}

Hello Team,

I am scheduled for an upcoming appointment at your facility and am writing in advance to confirm and arrange the following necessary medical accommodations under ADA guidelines:

{needs_str}

Please confirm receipt of this request and ensure these accommodations are noted in my patient profile prior to my arrival. 

Thank you,
AccessPath Patient Advocacy System
"""
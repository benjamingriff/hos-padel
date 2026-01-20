import streamlit as st
import pandas as pd
import json

# Load your data (you can replace this with your actual data inline or from file)
with open("court_data_18_06_2025.json") as f:
    data = json.load(f)

# Initialize list of courts from first entry
all_courts = {
    court_id: details["court_name"]
    for court_id, details in data[0]["court_status"].items()
}

# Build the table
table_rows = []
for slot in data:
    row = {"Time": f"{slot['start_time']} - {slot['end_time']}"}
    for court_id, court_name in all_courts.items():
        status = slot["court_status"].get(str(court_id)) or slot["court_status"].get(
            int(court_id)
        )
        if status:
            row[court_name] = "❌" if status["is_booked"] else "✅"
        else:
            row[court_name] = "-"
    table_rows.append(row)

df = pd.DataFrame(table_rows)

# Display in Streamlit
st.title("🏓 Padel Court Availability")
st.dataframe(df.set_index("Time"))

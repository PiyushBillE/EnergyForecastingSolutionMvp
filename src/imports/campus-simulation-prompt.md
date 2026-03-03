Perfect. We are now upgrading your project from:

“Static demo dashboard”
to
“Configurable AI-driven campus simulation platform.”

Below is a **precise Figma Make prompt** that:

* Adds the Campus Configuration feature
* Revises existing dashboard logic
* Introduces Simulation Mode vs Live Mode
* Removes unrealistic placeholder behavior
* Makes the system logically consistent

You can paste this into Figma Make to update your existing project.

---

# 🔥 PROMPT TO ADD CONFIGURABLE CAMPUS PROFILE & REVISE SYSTEM LOGIC

---

**Prompt:**

Enhance the existing Smart Energy Optimization Dashboard by introducing a configurable Campus Profile system and revising all dashboard analytics to dynamically reflect the selected campus configuration.

The system must operate in two modes:

1. Simulation Mode (default)
2. Live Mode (future integration placeholder)

The goal is to allow administrators to configure their campus characteristics instead of uploading raw datasets.

---

# 🏫 1️⃣ Add New Page: “Campus Configuration”

Add a new sidebar navigation item:

**Campus Profile**

This page should allow the user to define their campus attributes.

---

## 📝 Campus Configuration Form

Create a clean card layout titled:

“Configure Your Campus Environment”

Include the following fields:

1. Campus Size (Dropdown)

   * Small (1–5 buildings)
   * Medium (6–15 buildings)
   * Large (16+ buildings)

2. Number of Academic Buildings (Number Input)

3. Average Daily Occupancy (%) (Slider 0–100%)

4. Campus Location (City / State Input Field)

5. Has Residential Hostels? (Toggle Yes/No)

6. Peak Activity Hours (Time Range Selector)

7. Special Event Frequency (Dropdown)

   * Rare
   * Monthly
   * Weekly

Primary Button:
**“Initialize Campus Simulation”**

When clicked:

* Generate dynamic simulated dataset based on configuration
* Store configuration in state
* Redirect to Dashboard Overview

---

# ⚙ 2️⃣ Simulation Engine Logic (Frontend Representation)

Revise dashboard functionality so that:

Instead of showing static placeholder values:

The system must dynamically generate:

* Historical 30-day energy data
* Daily energy curve
* Occupancy patterns
* Peak load timing

All based on campus configuration inputs.

For example:

If campus size = Large
→ Base energy multiplier increases

If occupancy > 80%
→ Energy curves show higher daytime peaks

If hostels enabled
→ Nighttime energy baseline increases

If special events = Weekly
→ Random spike days appear in chart

---

# 🖥 3️⃣ Revise Dashboard Overview Page

Modify existing KPI cards and charts to:

* Pull from generated simulation data
* Update dynamically when configuration changes
* Display a visible badge at top-right:

🟡 Simulation Mode

Include tooltip explaining:
“Data is generated based on configured campus profile.”

---

# 📊 4️⃣ Revise Energy Forecast Page

Forecast should now:

* Use generated historical simulation
* Predict next 24 hours based on:

  * Occupancy pattern
  * Campus size multiplier
  * Peak activity hours

Peak alerts should reflect configured values.

---

# ⚡ 5️⃣ Revise Optimization Insights Page

Recommendations should adapt based on configuration:

Examples:

If Large Campus + High Occupancy:
→ Recommend HVAC zoning

If Hostels Enabled:
→ Recommend nighttime load balancing

If Small Campus:
→ Recommend lighting automation

Do NOT show static hardcoded recommendations.
They must conditionally change.

---

# 🌱 6️⃣ Sustainability Impact Page Revision

Calculate:

* Estimated annual energy consumption
* Potential reduction %
* CO₂ savings projection

Based on configured campus scale.

Display:

“Based on a Medium Campus with 10 Buildings and 75% Occupancy”

---

# 🔄 7️⃣ Add Mode Indicator in Header

Top-right corner badge:

🟡 Simulation Mode
🔵 Live Mode (Disabled – Coming Soon)

Live Mode should be visually disabled with tooltip:
“Requires smart meter integration.”

---

# 🧠 8️⃣ Backend/API Readiness

Structure application state so that:

All analytics components read from:

campusProfileState
simulationDataState

Prepare placeholders for:

/initialize-campus
/predict
/recommendations

Use mock dynamic logic for now.

---

# 🎨 UX Requirements

* Smooth transition when simulation regenerates
* Loading animation during dataset generation
* Persist configuration until reset
* Add “Reset Campus” button

---

# 🎯 Purpose of This Update

This transforms the project into:

An AI-powered configurable campus energy simulator.

It ensures:

✔ No unrealistic placeholder data
✔ Logical data generation
✔ Personalized analytics
✔ Professional system design
✔ Clear demo narrative

---

# 💎 What This Achieves

Now when a principal opens the system:

They configure their campus once.

The dashboard feels tailored.

Even without uploading raw datasets.

---

If you want next, I can:

* Design the actual simulation formula logic for you
* Or give you the backend algorithm to generate realistic campus data
* Or simplify this if you're short on time

Tell me your timeline and I’ll optimize the complexity.

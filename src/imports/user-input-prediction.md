Good catch — that feature is extremely important.

Right now your dashboard is only **displaying predictions**.
You also need a **User Input → Live Prediction → Recommendation** flow.

Below is a **separate add-on prompt** you can paste into Figma Make to extend your existing project.

---

# 🔥 PROMPT TO ADD USER INPUT PREDICTION FEATURE

---

**Prompt:**

Enhance the existing Smart Energy Optimization Dashboard by adding a new interactive feature called **“Custom Energy Prediction Simulator.”**

This feature must allow users to input specific parameters (date, time, occupancy, and environmental conditions) and receive a real-time AI-based energy prediction along with optimization recommendations.

The design must integrate seamlessly with the existing dashboard style (enterprise SaaS, Tailwind CSS, React + TypeScript).

---

## 📌 Add New Sidebar Item

Add a new navigation tab:

**Custom Prediction**

It should route to a new dedicated page.

---

# 🧮 Custom Prediction Page Layout

Create a clean two-column responsive layout:

Left Side → Input Form
Right Side → Prediction Results Panel

---

## 📝 Input Form Section

Create a professional form card titled:

**“Simulate Energy Usage Scenario”**

Include the following input fields:

1. Date Picker (calendar selector)
2. Time Selector (hour + minute dropdown)
3. Occupancy Percentage (slider 0–100%)
4. Temperature (°C input field)
5. Humidity (% input field)
6. Day Type (Dropdown: Weekday / Weekend / Holiday)
7. Special Event Toggle (On/Off switch)

At the bottom:

Primary Button:
**“Generate Prediction”**

When clicked:

* Trigger API-ready function placeholder (POST /predict)
* Show loading animation while waiting for response

---

# 📊 Prediction Results Panel

After clicking Generate Prediction, display results in a visually impactful way.

Include:

### 🔹 Predicted Energy Usage Card

* Large kWh number
* Risk badge (Low / Medium / High)
* Small comparison text (e.g., “12% higher than average weekday”)

---

### 🔹 Peak Risk Indicator

* Show if selected time falls under predicted peak load period
* Highlight in red if high risk

---

### 🔹 AI Recommendation Section

Card containing:

* Recommendation title
* Explanation paragraph
* Estimated Energy Reduction (%)
* Estimated Cost Savings (₹)
* Priority Level badge

---

### 🔹 Why This Prediction? (Explainable AI)

Add a small feature importance visual:

* Bar chart showing top 3 influencing factors
* Natural language explanation:

Example:
“Energy consumption is high due to elevated occupancy (85%) and high temperature (35°C).”

---

# 🎨 UX Enhancements

* Smooth transition animation when results appear
* Disable button while loading
* Clear form button
* Reset to default scenario button

---

# 🧠 Technical Requirements

Prepare this page to:

* Send POST request to /predict endpoint
* Accept JSON response:

Expected format:

{
predicted_energy: number,
risk_level: string,
top_factors: string[],
recommendation: string,
estimated_savings: number
}

Use mock API response for now if backend not connected.

---

# 📱 Responsiveness

On mobile:

* Form appears above results
* Results stack vertically
* Sidebar collapses

---

# 🎯 Purpose of Feature

This simulator allows campus administrators to:

* Test hypothetical scenarios
* Evaluate impact of occupancy changes
* Plan energy load shifts
* Make informed sustainability decisions

---

# 💎 Why This Feature Is Powerful

Now your system has:

✔ Forecasting
✔ Optimization
✔ Explainable AI
✔ Scenario Simulation (interactive AI tool)

This makes your project significantly stronger and more practical.

---

If you want, I can now:

* Provide the matching backend /predict API structure
* Or give you the exact ML logic that supports this simulator properly

Tell me your next step.

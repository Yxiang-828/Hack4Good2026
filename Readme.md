# Care Guardian System: Modular Care Infrastructure

**Project:** [View our Project](https://docs.google.com/spreadsheets/d/1kuZmSXCn86EIeHLcc9JAG513F-UOnR2w5pN0teiJT-0/edit?usp=sharing)

**Demo Video:** [Watch Project Demo](https://youtu.be/VKn6IKOhXsY?si=7_H-fpR9Oa2PCXMW)

## Testing Guide

To test the system:
1. Navigate to the project.
2. Go to any volunteer's sheet.
3. Click on the Google Form link.
4. Submit a relevant action, ensuring the help recipient's name matches exactly.
5. Observe the HP rise immediately on the volunteer's sheet.
6. Wait for the dashboard to update after a minute.

## The Problem Statement

Develop a solution that improves relationships between caregiver and the care recipient so that caregivers can provide the care that the care recipients want/need in a mutually respectful, meaningful, and joyful way.

## The Solution
**Care Guardian** is not just a tool; it is a **Modular Blueprint** for community care infrastructure. It transforms the ubiquitous Google Ecosystem (Sheets, Forms, Apps Script) into a high-stakes **Command Console**.

It replaces static data with **Gamified Urgency**. By utilizing video game mechanics—specifically "Health Bars" and "Active Decay"—we turn abstract care needs into visual, time-sensitive metrics that force the community to act.

## Key Features

### 1. The Command Console (Dashboard)
A "Dark Mode" visualization that serves as the central HUD (Heads Up Display) for administrators.
* **Visual Health Bars:** Two distinct metrics for **Physical HP** (Safety/Hygiene) and **Mental HP** (Dignity/Connection).
* **Real-Time Status:** Dynamic indicators that shift from "Secure" to "Critical" based on logic, not manual entry.
* **Console Aesthetic:** Custom Apps Script styling that overrides standard spreadsheet formatting to create a high-contrast interface.

### 2. The Forcing Function (Active Decay)
To solve the lack of urgency, the system runs a time-driven trigger every hour.
* **Decay Rate:** -10 HP / Hour (Configurable).
* **Impact:** If a volunteer does not visit, the dashboard visually degrades. Neglect becomes visible in real-time.

### 3. Radical Accessibility (The Volunteer View)
We removed all friction for the end-user.
* **Zero App Installation:** Works on any smartphone browser.
* **One-Step Restoration:** Volunteers restore HP simply by submitting a Google Form.
* **Dignity Protocol:** The landing page serves as a "Mission Manual," warning volunteers that high-efficiency cleaning without conversation drains "Mental HP."

## The Logic Engine

The backend is powered by **Google Apps Script**. The core restoration algorithm ensures that care is effective, preventing "point farming" while rewarding quality interactions.

### The Restoration Formula
$$
\text{HP Gained} = \text{Base Stat} \times \left(1 + \frac{\min(\text{Time}, 6)}{10}\right) \times \left(0.5 + \frac{\text{Rating}}{5}\right)
$$

### Logic Breakdown
1.  **Time Multiplier:** We cap the effective time at **6 hours** (`Math.min(time, 6)`). This prevents volunteers from logging unrealistic hours to artificially inflate scores.
2.  **Rating Multiplier:** A 5-star interaction (high quality) boosts the restoration significantly more than a 1-star interaction, even if the time spent is the same.
3.  **Dignity Penalty:** If specific "High Touch" tasks (e.g., bathing) are selected but the Interaction Rating is low, the script automatically applies a **Mental HP Penalty**, enforcing the philosophy that physical care without empathy is damaging.

## Tech Stack
* **Frontend:** Google Sheets (Visuals & Dashboard)
* **Input Layer:** Google Forms (Data Entry)
* **Backend:** Google Apps Script (Automation, Triggers, & Logic)

## How to Deploy (The Blueprint)

Care Guardian is designed as a **No-Code Blueprint**. Any community leader can deploy this without writing code.

### Step 1: Clone the Sheet
Copy the Master Spreadsheet template. This contains the pre-formatted Dashboard, Database, and Volunteer sheets.

### Step 2: Configure the Rules
Navigate to the `Config` sheet (if applicable) or access the Script Editor to adjust the `DECAY_RATE` constant.
* *Standard Mode:* -5 HP/hr
* *High Urgency Mode:* -10 HP/hr

### Step 3: Link the Form
1.  Create a Google Form with fields: `Elderly Name`, `Task Type`, `Duration`, `Rating`.
2.  Link the Form to the Spreadsheet.
3.  In Apps Script, set a Trigger for `onFormSubmit` to run the `restorationFunction`.

### Step 4: Activate Decay
In Apps Script, set a Time-Driven Trigger to run `decayFunction` every hour.

## Project Structure
```
/
├── Hp_Decay.gs        # Hourly HP decay function
├── HP_Restoration.gs  # Form submit restoration logic
├── Dashboard_gen.gs   # Dashboard update function
└── README.md          # Project documentation
```

---

*Built for the 2026 Hackathon.*

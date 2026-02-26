# NetScrunch Sales CRM - User Workflows

## Overview

This document outlines the key workflows for two primary user roles in the NetScrunch Sales CRM system:

- **B2B Manager** - Oversees team performance, sets strategy, and monitors pipeline health
- **Sales Representative** - Executes daily sales activities, manages leads, and closes deals

---

## A. B2B Manager Workflows

### Workflow 1: Weekly Pipeline Review & Team Performance Analysis

**Goal:** Review team performance, identify bottlenecks, and adjust strategy for the week.

**Steps:**

1. **Login & Dashboard Overview**
   - Navigate to `/dashboard`
   - Select "Manager View" from the view dropdown
   - Select "Weekly" from the time period dropdown
   - Review high-level KPIs:
     - Total active leads across team
     - Pipeline value
     - Overdue tasks count
     - Team-wide task completion

2. **Industry Insights Analysis**
   - Click "Industry Insights" tab
   - Review "Won Deals by Industry" bar chart to identify best-performing industries
   - Review "Leads by Industry" pie chart to see lead distribution
   - Identify underperforming industries that need attention

3. **Team Performance Review**
   - Click "Team Performance" tab
   - Review table showing each rep's:
     - Leads handled
     - Deals closed
     - Pipeline value
     - Average response time
   - Identify top performers and reps needing support

4. **Activity Monitoring**
   - Navigate to `/activity`
   - Filter by date range (last 7 days)
   - Filter by entity type (leads, deals, tasks)
   - Review team activity patterns and engagement levels

5. **Task Oversight**
   - Navigate to `/tasks`
   - Switch to "Team" view
   - Filter by team member to review individual workloads
   - Identify overdue tasks and reassign if necessary

6. **Lead Distribution Review**
   - Navigate to `/leads`
   - Use multi-select filters to view leads by owner
   - Check for uneven distribution
   - Note any leads that need reassignment

7. **Action Items**
   - Reassign overloaded leads to available reps
   - Schedule 1:1 meetings with underperforming reps
   - Update ICP targeting based on industry insights
   - Set team goals for the upcoming week

---

### Workflow 2: Monthly Strategy Planning & ICP Optimization

**Goal:** Analyze monthly performance data and refine Ideal Customer Profile (ICP) targeting.

**Steps:**

1. **Monthly Performance Review**
   - Navigate to `/dashboard`
   - Select "Manager View"
   - Change time period to "Monthly"
   - Document key metrics:
     - Total leads generated
     - Conversion rates by source
     - Revenue by stream

2. **ICP Performance Analysis**
   - Navigate to `/intended-customer-profiles`
   - Review all ICPs and their associated lead counts
   - Identify which ICPs generate the most qualified leads
   - Note ICPs with low conversion rates

3. **Prospects Quality Review**
   - Navigate to `/prospects`
   - Use ICP filter to view prospects by each ICP tag
   - Use multi-select filters:
     - Filter by company, job title, city, state
     - Identify patterns in high-quality prospects
   - Review conversion rate from prospect to lead by ICP

4. **Lead Source Analysis**
   - Navigate to `/leads`
   - Use the "Active Leads by Source" chart on dashboard
   - Cross-reference with won deals data
   - Identify highest-ROI lead sources

5. **ICP Strategy Adjustment**
   - Based on data, decide to:
     - Create new ICPs for emerging high-value segments
     - Deprioritize low-performing ICPs
     - Adjust targeting criteria (job titles, company sizes, locations)

6. **Team Communication**
   - Document ICP changes
   - Communicate new targeting priorities to team
   - Update sales scripts and outreach templates

---

### Workflow 3: Quarterly Business Review (QBR) Preparation

**Goal:** Compile comprehensive quarterly performance data for executive review.

**Steps:**

1. **Data Collection**
   - Navigate to `/dashboard`
   - Select "Manager View"
   - Change time period to "Quarterly"
   - Capture screenshots of all metrics:
     - Active leads by source
     - Deal pipeline by stage
     - Revenue by stream
     - Team performance table

2. **Trend Analysis**
   - Compare quarterly data to previous quarters
   - Calculate growth rates:
     - Lead volume growth
     - Pipeline value growth
     - Deal closure rate improvement
   - Identify seasonal patterns

3. **Team Performance Summary**
   - Navigate to `/activity`
   - Export activity data for the quarter
   - Calculate per-rep metrics:
     - Activities per rep
     - Response times
     - Task completion rates

4. **Pipeline Health Assessment**
   - Navigate to `/deals`
   - Review deals by stage
   - Calculate pipeline velocity
   - Identify deals at risk of stalling

5. **Forecasting**
   - Based on pipeline value and historical close rates
   - Project next quarter's revenue
   - Identify gaps to quota

6. **QBR Deck Preparation**
   - Compile all data into presentation
   - Include:
     - Executive summary
     - Key metrics and trends
     - Team performance highlights
     - Challenges and mitigation plans
     - Next quarter goals and forecasts

---

## B. Sales Representative Workflows

### Workflow 1: Daily Sales Activity Routine

**Goal:** Efficiently manage daily tasks, follow-ups, and lead engagement.

**Steps:**

1. **Morning Dashboard Check**
   - Navigate to `/dashboard`
   - Select "Personal View" from view dropdown
   - Select "Daily" from time period dropdown
   - Review personal KPIs:
     - Overdue tasks (priority #1)
     - Tasks due today
     - Meetings scheduled today
     - Follow-ups due today

2. **Task Management**
   - Navigate to `/tasks`
   - View is already set to "My Tasks" by default
   - Sort by due date
   - Complete overdue tasks first:
     - Click task to view details
     - Mark as complete after execution
   - Plan today's task execution order

3. **Lead Follow-ups**
   - Navigate to `/leads`
   - Use filters to find leads needing attention:
     - Filter by status (e.g., "Warmed-Up", "Negotiating")
     - Filter by your name in owner filter
   - For each lead:
     - Click "View" to see lead details
     - Review activity history
     - Execute planned follow-up (call, email, message)
     - Log activity
     - Create next task if needed

4. **Prospect Outreach**
   - Navigate to `/prospects`
   - Filter by:
     - Your name as owner
     - Status: "Not Contacted" or "Attempted to Contact"
   - For each prospect:
     - Review prospect information
     - Execute outreach (email, LinkedIn, call)
     - Update status based on response
     - If qualified, convert to lead using "Convert to Lead" button

5. **Deal Progression**
   - Navigate to `/deals`
   - Filter by your name and active stages
   - For each deal:
     - Click "View" to see deal details
     - Review associated lead information
     - Identify next steps to advance deal
     - Schedule meetings, send proposals as needed
     - Update deal stage when appropriate

6. **End-of-Day Wrap-up**
   - Return to `/tasks`
   - Mark all completed tasks
   - Create tasks for tomorrow
   - Review dashboard to confirm all due items addressed
   - Note any urgent items for tomorrow morning

---

### Workflow 2: Lead Qualification & Conversion

**Goal:** Systematically qualify prospects and convert them to leads for active selling.

**Steps:**

1. **Prospect Review**
   - Navigate to `/prospects`
   - Filter by:
     - Owner: Your name
     - Status: "Not Contacted" or "Pre-Qualified"
   - Sort by created date (newest first)

2. **Initial Qualification**
   - For each prospect:
     - Click "View" to see full prospect details
     - Review:
       - Company information
       - Job title (decision-maker?)
       - ICP tag match
       - Contact information completeness
     - Cross-reference with ICP criteria

3. **Outreach Execution**
   - Based on prospect profile, choose outreach method:
     - Email introduction
     - LinkedIn connection + message
     - Phone call
   - Document outreach in activity log

4. **Response Handling**
   - **No Response:**
     - Update status to "Attempted to Contact"
     - Create follow-up task for 2-3 days later
   - **Negative Response:**
     - Update status to "Not Qualified"
     - Add notes on reason for disqualification
   - **Positive Response:**
     - Update status to "Contacted"
     - Schedule discovery call
     - Create tasks for call preparation

5. **Discovery Call**
   - Conduct call using qualification framework:
     - Budget authority
     - Need identification
     - Timeline
     - Decision process
   - Take detailed notes

6. **Qualification Decision**
   - **If Qualified:**
     - Navigate to prospect detail page
     - Click "Convert to Lead" button
     - Fill in additional lead information:
       - Source
       - Initial requirements
       - Call notes
     - Set lead status to "Warmed-Up"
     - Create follow-up tasks
   - **If Not Qualified:**
     - Update prospect status to "Not Qualified"
     - Document reason
     - Consider for future nurturing

7. **Lead Handoff (if applicable)**
   - If lead requires specialist attention:
     - Use "Reassign Lead" function
     - Add handoff notes
     - Notify receiving team member

---

### Workflow 3: Deal Management & Closure

**Goal:** Move deals through pipeline stages efficiently to successful closure.

**Steps:**

1. **Deal Pipeline Review**
   - Navigate to `/deals`
   - Filter by:
     - Owner: Your name
     - Stage: All active stages
   - Review deal distribution across stages
   - Identify deals needing immediate attention

2. **Deal Detail Review**
   - For each active deal:
     - Click "View" to see deal details
     - Review:
       - Deal value
       - Close date
       - Current stage
       - Associated lead information
       - All tasks and activities
       - Notes history

3. **Stage-Specific Actions**

   **Prospecting Stage:**
   - Research company background
   - Identify all stakeholders
   - Create tasks for stakeholder outreach
   - Schedule introductory meetings

   **Qualification Stage:**
   - Conduct needs assessment
   - Confirm budget and authority
   - Document pain points
   - Create qualification summary

   **Proposal Stage:**
   - Prepare customized proposal
   - Include pricing, timeline, deliverables
   - Schedule proposal presentation
   - Create follow-up task for proposal review

   **Negotiation Stage:**
   - Document negotiation points
   - Coordinate with management on concessions
   - Schedule negotiation calls
   - Update deal value and terms as agreed

4. **Task Management for Deals**
   - Navigate to deal detail page
   - Review existing tasks
   - Create new tasks as needed:
     - Type: Call, Email, Meeting, Proposal, Follow-up
     - Due date based on deal timeline
     - Description with specific action items
   - Complete tasks and log outcomes

5. **Activity Logging**
   - After each customer interaction:
     - Navigate to deal page
     - Log activity with:
       - Type of interaction
       - Summary of discussion
       - Next steps agreed
       - Any concerns raised

6. **Closing the Deal**
   - **When Won:**
     - Update deal stage to "Won"
     - Confirm final value and terms
     - Document win reason
     - Create handoff tasks for delivery team
     - Schedule kickoff meeting
   - **When Lost:**
     - Update deal stage to "Lost"
     - Document loss reason
     - Note any future opportunities
     - Create task for post-loss analysis

7. **Pipeline Maintenance**
   - Weekly review of all deals
   - Update close dates if slipped
   - Adjust values if changed
   - Remove stale deals (with manager approval)
   - Ensure all deals have next steps defined

---

### Workflow 4: Weekly Planning & Preparation

**Goal:** Start each week organized with clear priorities and action plans.

**Steps:**

1. **Weekly Dashboard Review**
   - Navigate to `/dashboard`
   - Select "Personal View"
   - Change time period to "Weekly"
   - Review:
     - Tasks completed last week
     - Tasks carried over
     - Personal performance metrics

2. **Lead Prioritization**
   - Navigate to `/leads`
   - Filter by your name
   - Sort by status and created date
   - Identify priority leads:
     - Hot leads (Negotiating, Warmed-Up)
     - Leads with upcoming follow-ups
     - Leads that haven't been contacted in 5+ days
   - Create task list for the week

3. **Deal Pipeline Planning**
   - Navigate to `/deals`
   - Filter by your name
   - For each active deal:
     - Review close date
     - Identify deals closing this month
     - Create action plan for each priority deal
     - Schedule specific activities to advance deals

4. **Prospect Outreach Planning**
   - Navigate to `/prospects`
   - Filter by:
     - Owner: Your name
     - Status: Not Contacted, Pre-Qualified
   - Set weekly outreach goals:
     - Number of new prospects to contact
     - Number of follow-ups to complete
   - Block time on calendar for outreach

5. **Task Calendar Setup**
   - Navigate to `/tasks`
   - Review all open tasks
   - Assign specific days/times for:
     - Call blocks
     - Email blocks
     - Meeting preparation
     - Follow-up sequences
   - Create recurring tasks for routine activities

6. **ICP Alignment Check**
   - Review current ICPs at `/intended-customer-profiles`
   - Ensure prospecting aligns with priority ICPs
   - Adjust outreach messaging based on ICP characteristics

7. **Week Commitments**
   - Document weekly goals:
     - Number of prospect conversations
     - Number of leads to qualify
     - Number of proposals to send
     - Revenue target for deals closing
   - Share goals with manager if required

---

## Cross-Role Collaboration Workflows

### Manager-Rep 1:1 Meeting Workflow

**Frequency:** Weekly or bi-weekly

**Preparation (Rep):**

1. Review personal dashboard metrics
2. Prepare list of deals needing support
3. Document challenges and blockers
4. Review activity completion rates

**Preparation (Manager):**

1. Review rep's dashboard metrics
2. Review rep's activity log
3. Identify performance trends
4. Prepare coaching points

**Meeting Agenda:**

1. Review last week's commitments
2. Discuss pipeline health
3. Review specific deals:
   - Strategy for key opportunities
   - Obstacle removal
   - Resource needs
4. Activity and behavior coaching
5. Set commitments for next week

**Follow-up:**

- Manager: Update CRM notes on support provided
- Rep: Update deal plans based on feedback
- Both: Track commitment completion

---

### Lead Reassignment Workflow

**Trigger:** Lead needs to be transferred between reps

**Steps:**

1. Current owner reviews lead history
2. Current owner documents current status
3. Current owner uses "Reassign Lead" function
4. Current owner notifies receiving rep
5. Receiving rep reviews lead details
6. Receiving rep creates initial outreach task
7. Receiving rep updates lead owner field
8. Activity log automatically records reassignment

---

## Notes

- All workflows assume proper CRM hygiene (timely logging, accurate data)
- Time periods and filters should be used consistently for accurate tracking
- Mobile access may be available for certain workflows (field sales)
- Integration with email/calendar systems may automate certain steps

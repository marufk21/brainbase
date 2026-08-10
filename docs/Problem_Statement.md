_Take-Home Assignment – Knowledge System_ 

# **Take-Home Assignment** 

### **Duration: 72 hours (3 days)** 

### **IMPORTANT – READ FIRST** 

- **You must reply to the email and acknowledge that you have received this assignment before you start the 72-hour clock.** 

- The 72 hours start only after we receive your acknowledgment. 

- Create a separate new repository only for this assignment. 

## **Context** 

You will build a system for a small AI consulting team (about 8–15 people). 

Right now their knowledge is scattered. Client details, project notes, decisions, documents, people information, and important topics live in Notion, Slack, Google Docs, emails, and people’s heads. Connections between these things get lost. The same questions are asked again and again. New people take a long time to understand how things work. 

## **Your Job** 

Build a working system that helps the team store, connect, and find this knowledge easily. 

#### **The system should allow users to:** 

- Add and manage information about people, projects, clients, documents, decisions, and topics 

- Create and keep relationships between these things 

- Ask questions (in normal language or structured form) and get answers that use the relationships, not just simple keyword search 

- See how different pieces of knowledge are connected 

- Keep the knowledge useful when new information is added 

## **Sample Data – Important** 

#### **The files in the sample-data folder are completely fictional.** 

- They are created only for this assignment. 

- Do not treat any names, companies, projects, or decisions as real. 

- Do not use this data for anything outside this assessment. 

- You can use the files as they are, extend them, or replace them with your own sample data. 

You do not need to integrate with every real tool. Integrating with just one source (for example Google Docs) is enough. For everything else, use the sample files provided in the repository. Do not waste time building many real integrations. 

## **What Good Answers Look Like** 

Your system should be able to answer questions that need connections between different pieces of information. Simple keyword search is not enough. 

### **Example 1 – Structured style question** 

**Question:** “Who worked on the Lexora project and what key decisions were made about its approach?” **Weak answer:** Only returns the project description or a list of names from a single document. 

Page 1 

_Take-Home Assignment – Knowledge System_ 

**Strong answer:** Returns the team members linked to the project, the important decision about preferring structured linking over pure vector search, who made that decision, and when. Shows the connections clearly. 

### **Example 2 – Natural language / unstructured style question** 

**Question:** “What did we learn from the FinEdge project that is useful for Lexora?” 

**Weak answer:** Returns the FinEdge handover document or any document that mentions both names. 

**Strong answer:** Connects the lesson from FinEdge (relationships and evolution of ideas matter more than pure document retrieval) to the later decision made for Lexora. Shows how one project influenced another. 

### **Example 3 – Exploration style** 

**Question:** “Show me everything related to the decision about not integrating Slack in the internal knowledge base.” 

**Strong answer:** Returns the decision itself, the people involved, the related internal project, the reasoning, and any documents or messages that discuss the same topic. 

_These examples are only to show the kind of thinking we value. Your system does not need to answer exactly these questions. It needs to support this style of connected answers._ 

## **Important Notes** 

- Focus on solid structure and working connections. A smaller system that works well is better than a large system with many incomplete features. 

- Basic authentication is enough. You do not need production-level security or complex permissions. 

- Include realistic sample data so we can test the system properly. 

- You can ask clarifying questions during the 72 hours. 

- You can choose any tech stack. 

## **What You Must Submit** 

1. **A separate new repository** only for this assignment. 

2. **Working application** (running online or clear instructions to run it locally). 

3. **Proper design document** (not rough notes). Content is more important than perfect English. It must explain: 

   - How you understood the problem 

   - Your architecture and important design choices (especially how you store and connect data) 

   - Trade-offs you made 

   - What works, what is incomplete, and why 

   - How to run and test the system 

4. **Automated tests** and any extra testing notes. 5. **Clear README** with setup steps. 

## **How We Will Evaluate** 

We will: 

- Read and understand your code 

- Follow the flow of the system 

- Try to break it 

- Judge how well your design handles real knowledge work 

#### **Clear thinking and solid structure matter more than the number of features.** 

Page 2 

_Take-Home Assignment – Knowledge System_ 

## **AI Credits** 

If you need Gemini credits to finish this project, just ask us. We will provide them. 

## **Final Note** 

We care most about how you think, how you structure the problem, and how you turn a broad need into a concrete working system. 

Good luck. 

Page 3 


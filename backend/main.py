from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from supabase import create_client
from langchain_groq import ChatGroq
from langgraph.prebuilt import create_react_agent
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_core.tools import tool
from pydantic import BaseModel
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0
)

# Set up search tool
@tool 
def web_search(query: str) -> str:
    """Search the web for current information about any topic."""
    return DuckDuckGoSearchRun().run(query)

tools = [web_search]

class ResearchRequest(BaseModel):
    question: str

@app.get("/")
def read_root():
    return {"message": "AI Research Agent API is running!"}

@app.post("/research")
async def research(request: ResearchRequest):

     # Step 1: Create agent
    agent = create_react_agent(llm, tools)

    # Step 2: Run the agent
    result = agent.invoke({
        "messages": [("human", request.question)]
    })

   
    # Step 3: Get the answer
    messages = result["messages"]

    answer = ""
    for msg in reversed(messages):
        if hasattr(msg, 'content') and msg.content and not hasattr(msg, 'tool_calls'):
            answer = msg.content
            break

    # Step 4: Save to Supabase
    supabase.schema("project4").table("research").insert({
        "question": request.question,
        "answer": answer,
    }).execute()

    # Step 5: Return Answer
    return {
        "answer": answer
    }
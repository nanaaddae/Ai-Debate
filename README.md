# 🗣️ AI-Powered Debate Platform

A full-stack web application that uses AI to generate balanced arguments and analyze debate quality, helping users explore multiple perspectives on controversial topics.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Features

### AI Integration
- **AI Argument Generation**: Automatically generates balanced pro/con arguments for any debate topic using Groq's LLaMA 3.3 70B model
- **Quality Scoring System**: AI evaluates user arguments on 4 dimensions (Logic, Evidence, Relevance, Persuasiveness) with 0-100 scores
- **Debate Summarization**: AI generates comprehensive summaries of closed debates, determining winners and identifying key points from both sides

### User Features
- **Real-time Updates**: Live vote counts and new arguments via WebSocket connections
- **User Profiles**: Track debate history, arguments posted, reputation scores, and activity
- **Advanced Search**: Filter debates by keyword, tags, status, and sort by newest, most voted, or controversial
- **Tag System**: Categorize debates by topic (Politics, Technology, Ethics, Science, etc.)

### Moderation & Security
- **Role-Based Access Control (RBAC)**: 4 permission levels (Admin, Moderator, Verified User, Guest)
- **Admin Dashboard**: Platform moderation tools, user management, and analytics
- **Quality Moderation**: AI-powered content scoring to encourage thoughtful discourse
- **JWT Authentication**: Secure token-based authentication with password hashing

---

## 🛠️ Tech Stack

**Backend:**
- Python 3.12+
- FastAPI (async web framework)
- SQLAlchemy (ORM)
- PostgreSQL / SQLite (database)
- WebSockets (Socket.IO)
- JWT + Argon2 (authentication)
- Pydantic (data validation)

**Frontend:**
- React 18.2
- React Router (navigation)
- Axios (API client)
- Socket.IO Client (WebSockets)
- Tailwind CSS (styling)

**AI/ML:**
- Groq API (LLaMA 3.3 70B)
- Natural Language Processing for quality scoring

---

## 📸 Screenshots

### Homepage
*Browse debates with advanced filtering and search*
<img width="1236" height="837" alt="image" src="https://github.com/user-attachments/assets/788bb066-ffb8-47f7-ab1a-f7cf272bfda5" />


### Debate Detail
*AI-generated arguments, user contributions, and real-time voting*
<img width="913" height="845" alt="image" src="https://github.com/user-attachments/assets/0b80e0ea-47f8-4e48-8efa-cb32f98c1424" />



### AI Quality Scoring
*Automated argument evaluation with detailed breakdowns*
<img width="886" height="740" alt="image" src="https://github.com/user-attachments/assets/6b9a32eb-066c-4b70-b4eb-d39704e21e51" />


### Admin Dashboard
*Platform moderation and user management*
<img width="1165" height="357" alt="image" src="https://github.com/user-attachments/assets/2b19b3d9-e041-468b-97eb-5cfeae362deb" />


---

## 🚀 Installation

### Prerequisites
- Python 3.12+
- Node.js 16+
- Groq API Key ([Get one free here](https://console.groq.com))

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/nanaaddae/Ai-Debate.git
cd ai-debate/ai-debate-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Seed database with tags
python seed_tags.py

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
# In a new terminal
cd ai-debate/frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will be available at `http://localhost:3000`

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=sqlite:///./debate_platform.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your-groq-api-key-here
```

**Get a Groq API Key:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Create an API key
4. Add it to your `.env` file

---

## 🧪 Testing

Run the test suite:

```bash
cd backend
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py
```

**Test Coverage:** 11 passing tests covering:
- Authentication (registration, login, duplicate prevention)
- Debate CRUD operations
- Voting system
- API health checks

---

## 📖 API Documentation

Once the backend is running, visit:
- **Interactive API Docs (Swagger)**: `http://localhost:8000/docs`
- **Alternative Docs (ReDoc)**: `http://localhost:8000/redoc`

### Key Endpoints

```
POST   /api/v1/auth/register          # Register new user
POST   /api/v1/auth/login             # Login
GET    /api/v1/debates/               # List debates
POST   /api/v1/debates/               # Create debate (generates AI arguments)
GET    /api/v1/debates/{id}           # Get debate details
POST   /api/v1/debates/{id}/vote      # Vote on debate
POST   /api/v1/arguments/debates/{id}/arguments  # Add argument (AI scores it)
POST   /api/v1/debates/{id}/generate-summary     # Generate AI summary
```

---

## 🏗️ Project Structure

```
ai-debate-platform/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── core/             # Security, permissions
│   │   ├── models/           # Database models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic (AI, WebSockets)
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Database setup
│   │   └── main.py           # FastAPI app
│   ├── tests/                # Test suite
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment template
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── context/          # React context (auth)
    │   ├── services/         # API client
    │   ├── hooks/            # Custom hooks (WebSocket)
    │   └── App.js            # Main app
    ├── package.json          # Node dependencies
    └── tailwind.config.js    # Tailwind configuration
```

---

## 🎮 Usage

### Creating a Debate

1. **Register/Login** to your account
2. Click **"Create Debate"**
3. Enter your debate topic (e.g., "Should AI be regulated by governments?")
4. Add optional description and tags
5. **AI automatically generates** balanced pro/con arguments
6. Users can now vote and add their own arguments

### Adding Arguments

1. Navigate to any active debate
2. Write your argument
3. Select PRO or CON side
4. Submit - **AI automatically scores** your argument on:
   - Logic (0-100)
   - Evidence (0-100)
   - Relevance (0-100)
   - Persuasiveness (0-100)

### Closing Debates

1. Moderators/Admins can close debates
2. **AI automatically generates** a summary including:
   - Winner determination (PRO/CON/TIE)
   - Comprehensive debate summary
   - Key points from both sides
   - Areas of common ground

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Guest** | View debates, view arguments |
| **Verified User** | Create debates, add arguments, vote |
| **Moderator** | Close/lock debates, manage content, view analytics |
| **Admin** | All permissions, manage users, assign roles |

---

## 🌟 Key Features Explained

### AI Argument Generation
When a debate is created, the system prompts LLaMA 3.3 to generate:
- A compelling PRO argument (under 300 words)
- A compelling CON argument (under 300 words)
- Both arguments are factual, persuasive, and balanced

### AI Quality Scoring
Every user argument is evaluated on:
- **Logic**: Reasoning soundness, absence of fallacies
- **Evidence**: Use of facts, data, examples
- **Relevance**: On-topic, addresses the debate
- **Persuasiveness**: Convincingness and effectiveness

Scores are visible to users to encourage higher-quality discourse.

### Real-Time Updates
- Vote counts update instantly across all connected users
- New arguments appear live without page refresh
- WebSocket connections maintain low-latency updates

---

## 🚧 Roadmap

- [ ] Email verification system
- [ ] Comment threads on arguments
- [ ] AI fact-checking integration
- [ ] Debate templates (Oxford style, Lincoln-Douglas)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Notification system
- [ ] Rich text editor support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Groq](https://groq.com) for providing free access to LLaMA 3.3 70B
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent async web framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

---

## 📧 Contact

 nana_addae@yahoo.com
---

## 📊 Stats

- **Backend:** ~3,000 lines of Python
- **Frontend:** ~2,500 lines of JavaScript/React
- **Test Coverage:** 11 passing tests
- **AI Models:** LLaMA 3.3 70B (Groq)
- **Database:** PostgreSQL/SQLite with SQLAlchemy ORM

---

**Built with ❤️ and AI**



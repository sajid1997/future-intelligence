
import { useState, useEffect } from "react";

function App() {
  const [question, setQuestion] = useState("");
  const [queries, setQueries] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load recent research from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/queries")
      .then((response) => response.json())
      .then((data) => {
        console.log("Queries loaded:", data);
        setQueries(data);
      })
      .catch((error) => {
        console.error("Failed to load queries:", error);
      });
  }, []);

  // Submit question and generate forecast
  const handleSubmit = async () => {
    if (!question.trim() || loading) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/queries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setResult({
        question: data.query.question,
        prediction: data.prediction.prediction,
        probability: data.prediction.probability,
        confidence: data.prediction.confidence,
        timeHorizon: data.prediction.time_horizon,
      });

      // Add new research to sidebar immediately
      setQueries((oldQueries) => [
        data.query,
        ...oldQueries,
      ]);

      setQuestion("");
    } catch (error) {
      console.error(error);
      alert("Failed to generate forecast.");
    } finally {
      setLoading(false);
    }
  };

  // Start new research
  const newResearch = () => {
    setQuestion("");
    setResult(null);
  };

  // Click recent research
  const selectResearch = async (query) => {
    setQuestion(query.question);

    try {
      const response = await fetch(
        `http://localhost:5000/api/predictions/${query.query_id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to load prediction");
      }

      if (data.length > 0) {
        const prediction = data[0];

        setResult({
          question: query.question,
          prediction: prediction.prediction,
          probability: prediction.probability,
          confidence: prediction.confidence,
          timeHorizon: prediction.time_horizon,
        });

        setQuestion("");
      }
    } catch (error) {
      console.error("Failed to load research:", error);
    }
  };

  return (
    <div className="app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="logo">
          <span>◈</span>

          <div>
            <strong>Future</strong>
            <small>Intelligence</small>
          </div>
        </div>

        <button
          className="new-research"
          onClick={newResearch}
        >
          ＋ New Research
        </button>

        <div className="recent-title">
          RECENT RESEARCH
        </div>

        <div className="recent-list">

          {queries.slice(0, 10).map((query) => (

            <button
              key={query.query_id}
              className="recent-item"
              onClick={() => selectResearch(query)}
            >
              ◌ {query.question}
            </button>

          ))}

        </div>

        <div className="engine-status">

          <span></span>

          <div>
            <strong>Intelligence Engine</strong>
            <small>System operational</small>
          </div>

        </div>

      </aside>


      {/* MAIN CHAT */}
      <main className="chat">

        <header className="chat-header">

          <div>
            <h1>Future Intelligence</h1>
            <p>
              AI-powered probabilistic forecasting
            </p>
          </div>

          <div className="online">
            <span></span>
            Online
          </div>

        </header>


        {/* CONVERSATION */}
        <section className="conversation">

          {/* ANALYZING */}
          {loading && (

            <div className="analyzing">

              <div className="analyzing-icon">
                ◈
              </div>

              <h2>
                Analyzing the future...
              </h2>

              <p>
                Our intelligence engine is generating
                a probabilistic forecast.
              </p>

              <div className="analyzing-dots">

                <span></span>
                <span></span>
                <span></span>

              </div>

            </div>

          )}


          {/* WELCOME */}
          {!result && !loading && (

            <div className="welcome">

              <div className="welcome-icon">
                ◈
              </div>

              <h2>
                What do you want to know
                <br />
                <span>about the future?</span>
              </h2>

              <p>
                Ask a question and let our intelligence
                engine generate a probabilistic forecast.
              </p>


              <div className="examples">

                <button
                  onClick={() =>
                    setQuestion(
                      "Will AI replace jobs in the next 5 years?"
                    )
                  }
                >
                  <strong>AI & Jobs</strong>
                  <small>
                    Will AI replace jobs?
                  </small>
                </button>


                <button
                  onClick={() =>
                    setQuestion(
                      "Will Bitcoin rise in the next 3 years?"
                    )
                  }
                >
                  <strong>Markets</strong>
                  <small>
                    Will Bitcoin rise?
                  </small>
                </button>


                <button
                  onClick={() =>
                    setQuestion(
                      "What is the future of electric cars?"
                    )
                  }
                >
                  <strong>Technology</strong>
                  <small>
                    Future of electric cars?
                  </small>
                </button>

              </div>

            </div>

          )}


          {/* FORECAST RESULT */}
          {result && !loading && (

            <div className="result">


              {/* USER QUESTION */}
              <div className="user-message">

                <div className="avatar user">
                  You
                </div>

                <div>

                  <small>
                    You
                  </small>

                  <p>
                    {result.question}
                  </p>

                </div>

              </div>


              {/* AI RESPONSE */}
              <div className="ai-message">

                <div className="avatar ai">
                  ◈
                </div>


                <div className="ai-content">

                  <small>
                    Future Intelligence
                  </small>


                  <div className="forecast">


                    <div className="forecast-header">

                      <div>

                        <label>
                          CURRENT FORECAST
                        </label>

                        <h3>
                          Probabilistic Outlook
                        </h3>

                      </div>


                      <span className="confidence">
                        {result.confidence} Confidence
                      </span>

                    </div>


                    <div className="forecast-body">


                      <div className="probability">

                        <strong>
                          {result.probability !== null
                            ? result.probability + "%"
                            : "—"}
                        </strong>

                        <span>
                          Probability
                        </span>

                      </div>


                      <p>
                        {result.prediction}
                      </p>

                    </div>


                    <div className="details">


                      <div>

                        <label>
                          TIME HORIZON
                        </label>

                        <strong>
                          {result.timeHorizon || "Pending"}
                        </strong>

                      </div>


                      <div>

                        <label>
                          CONFIDENCE
                        </label>

                        <strong>
                          {result.confidence}
                        </strong>

                      </div>


                      <div>

                        <label>
                          ANALYSIS
                        </label>

                        <strong>
                          AI Forecast
                        </strong>

                      </div>


                    </div>

                  </div>

                </div>

              </div>

            </div>

          )}

        </section>


        {/* INPUT */}
        <div className="input-area">

          <div className="input-box">

            <textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {

                  e.preventDefault();
                  handleSubmit();

                }

              }}
              placeholder="Ask anything about the future..."
              rows="1"
            />


            <button
              onClick={handleSubmit}
              disabled={!question.trim() || loading}
            >
              {loading ? "⟳" : "↑"}
            </button>

          </div>


          <p>
            Press Enter to analyze · Shift + Enter for new line
          </p>

        </div>

      </main>

    </div>
  );
}

export default App;

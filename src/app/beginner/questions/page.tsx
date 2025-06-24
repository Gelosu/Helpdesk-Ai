'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/components/loading';

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: number;
}

export default function BeginnerQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [points, setPoints] = useState(0);
  const [startTime] = useState(Date.now());
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(300);
  const [showResults, setShowResults] = useState(false);
  const [assistCount, setAssistCount] = useState(3);
  const [usedAssist, setUsedAssist] = useState(false);
  const [highlightedOptions, setHighlightedOptions] = useState<number[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [correctQuestions, setCorrectQuestions] = useState<Set<number>>(new Set());
  const [showExitModal, setShowExitModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [showLoader, setShowLoader] = useState(true);
  const [userIcon, setUserIcon] = useState<string | null>(null);

  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storedId = sessionStorage.getItem('user_id');
    if (storedId) {
      const fetchUser = async () => {
        try {
          const res = await fetch(`/api/accounts?id=${storedId}`);
          if (!res.ok) throw new Error('Failed to fetch user');
          const data = await res.json();
          setUsername(data.username);
          setUserIcon(data.icons);
          setUserId(data.id);
        } catch (err) {
          console.error('❌ Failed to fetch user info:', err);
        }
      };
      fetchUser();
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('/api/questions/beginner');
        const data: Question[] = await res.json();
        const randomized = shuffleArray(data).map((q) => {
          const options = shuffleArray(q.options);
          const newAnswerIndex = options.indexOf(q.options[q.answer]);
          return { ...q, options, answer: newAnswerIndex };
        });
        setQuestions(randomized);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setEndTime(Date.now());
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, []);

  useEffect(() => {
    if (showResults && userId && username) {
      const totalAnswered = points / 10;
      const averageSpeed = points > 0 ? (endTime! - startTime) / totalAnswered / 1000 : 0;
      const average = Number(averageSpeed.toFixed(2));
      const achievement =
        points >= 270
          ? '🌟 Master Resolver'
          : points >= 200
          ? '🏆 Ticket Pro'
          : points >= 100
          ? '🎯 On the Way'
          : '📘 Beginner';

      const saveResult = async () => {
        try {
          const res = await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              username,
              total_questions: questions.length,
              correct_answers: totalAnswered,
              total_points: points,
              average_time_per_question: average,
              achievement,
            }),
          });

          setSaveStatus(res.ok ? 'success' : 'error');
        } catch {
          setSaveStatus('error');
        }

        setTimeout(() => setSaveStatus('idle'), 3000);
      };

      saveResult();
    }
  }, [showResults, userId, username]);

  const handleSelect = (index: number) => {
    if (!submitted) setSelected(index);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === questions[current].answer) {
      setPoints((prev) => prev + 10);
      setCorrectQuestions((prev) => new Set(prev).add(questions[current].id));
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setUsedAssist(false);
      setHighlightedOptions([]);
    } else {
      clearInterval(timerRef.current!);
      setEndTime(Date.now());
      setShowResults(true);
    }
  };

  const handleQuickAssist = () => {
    if (usedAssist || assistCount <= 0) return;
    const correct = questions[current].answer;
    const otherOptions = questions[current].options.map((_, i) => i).filter(i => i !== correct);
    const second = otherOptions[Math.floor(Math.random() * otherOptions.length)];
    setHighlightedOptions([correct, second]);
    setUsedAssist(true);
    setAssistCount((prev) => prev - 1);
  };

  const handleComplete = () => {
    router.push('/accountlogin/');
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // ✅ Moved these here to fix the render error
  const totalAnswered = points / 10;
  const averageSpeed = points > 0 && endTime ? (endTime - startTime) / totalAnswered / 1000 : 0;
  const average = Number(averageSpeed.toFixed(2));
  const achievement =
    points >= 270
      ? '🌟 Master Resolver'
      : points >= 200
      ? '🏆 Ticket Pro'
      : points >= 100
      ? '🎯 On the Way'
      : '📘 Beginner';

  const q = questions[current];

  if (showLoader || questions.length === 0) {
    return <Loading />;
  }

  return (
    <>
      {/* ✅ Toast Notification */}
      {saveStatus !== "idle" && (
        <div className={`fixed top-6 right-6 px-4 py-2 rounded shadow-lg z-50 text-white transition-all duration-300
          ${saveStatus === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {saveStatus === "success" ? "✅ Result saved successfully!" : "❌ Failed to save result."}
        </div>
      )}

      {/* Show result screen */}
      {showResults ? (
        <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center justify-center px-4 py-12">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <h1 className="text-3xl font-bold text-blue-400 mb-4">CHALLENGE COMPLETED!</h1>
            <div className="space-y-4 text-left text-lg">
              <p><span className="text-gray-400">👤 User:</span> <span className="font-semibold">{username || 'Guest'}</span></p>
              <p><span className="text-gray-400">🎟️ Tickets Resolved:</span> <span className="font-semibold">{totalAnswered} / {questions.length}</span></p>
              <p><span className="text-gray-400">💯 Points:</span> <span className={`font-semibold ${points >= 200 ? 'text-green-400' : points >= 100 ? 'text-yellow-300' : 'text-red-400'}`}>{points}</span></p>
              <p><span className="text-gray-400">⏱ Avg Time per Ticket:</span> <span className="font-semibold">{average}s</span></p>
              <p><span className="text-gray-400">🏅 Achievement:</span> <span className="font-semibold">{achievement}</span></p>
            </div>
            <button
              onClick={handleComplete}
              className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full text-white font-semibold transition"
            >
              🔁 Return to Home
            </button>
          </div>
        </div>
      ) : questions.length === 0 ? (
  <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-6">
    {/* Your GIF Loader */}
    <img
      src="/loadings/loading.gif"
      alt="Loading..."
      className="w-32 h-32 object-contain"
    />

    {/* Loading text with animated dots */}
    <p className="text-lg flex items-center">
      Loading questions
      <span className="ml-1 flex space-x-1">
        <span className="dot animate-dot animation-delay-0">.</span>
        <span className="dot animate-dot animation-delay-1">.</span>
        <span className="dot animate-dot animation-delay-2">.</span>
      </span>
    </p>

    {/* Custom animations */}
    <style jsx>{`
      .dot {
        opacity: 0;
        animation: dotFade 1.5s infinite;
      }
      .animation-delay-0 {
        animation-delay: 0s;
      }
      .animation-delay-1 {
        animation-delay: 0.3s;
      }
      .animation-delay-2 {
        animation-delay: 0.6s;
      }
      @keyframes dotFade {
        0%, 20% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `}</style>
  </div>
      )

       : (
        <div className="min-h-screen bg-gray-700 text-white px-4 py-8 flex flex-col items-center">
          {/* HEADER */}
         <div className="w-full max-w-6xl mb-4 px-2 overflow-x-auto">
            <div className="flex items-center justify-between whitespace-nowrap space-x-4 text-sm">
              {/* ✅ Avatar + Username with real icon */}
                <div className="flex items-center space-x-2">
                  <img
                    src={userIcon || '/icon/defaulticon.jpg'}
                    alt="User Icon"
                    className="w-8 h-8 rounded-full object-cover border border-white"
                  />
                  <div className="text-sm font-semibold text-white">{username || 'Guest'}</div>
                </div>
              {/* Stats */}
              <div className="flex items-center space-x-4 text-white">
                <div>🎟️ <span className="font-bold">{correctQuestions.size} / 30</span></div>
                <div>🕒 <span className="font-bold">
                  {points > 0 ? ((Date.now() - startTime) / (points / 10) / 1000).toFixed(2) : 0}s
                </span></div>
                <div>🎖️ <span className="font-bold text-yellow-400">TBD</span></div>
              </div>
            </div>
          </div>



          {/* TIMER BAR */}
          <div className="w-full max-w-2xl mb-4 flex items-center space-x-2">
            <span className="text-xl">⏳</span>
            <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-100 linear" style={{ width: `${(timeLeft / 300) * 100}%` }} />
            </div>
          </div>

          {/* QUESTION PANEL */}
          <div className="w-full max-w-2xl bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">{q.question}</h2>
            <div className="space-y-4">
              {q.options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(index)}
                  className={`w-full text-left px-4 py-2 rounded-md border transition-colors duration-200
                    ${submitted && index === q.answer ? 'bg-green-600 border-green-700' : ''}
                    ${submitted && selected === index && index !== q.answer ? 'bg-red-600 border-red-700' : ''}
                    ${!submitted && selected === index ? 'bg-blue-600 border-blue-700' : 'bg-gray-800 border-gray-700'}
                    ${highlightedOptions.includes(index) && !submitted ? 'bg-yellow-400 text-black' : ''}`}
                  disabled={submitted}
                >
                  {opt}
                </button>
              ))}
            </div>

            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null}
                className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold disabled:opacity-50"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="mt-6 bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
              >
                Next Question
              </button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-400">Question {current + 1} of {questions.length}</p>

          {/* FOOTER CONTROLS */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={handleQuickAssist}
              disabled={usedAssist || assistCount <= 0}
              className={`inline-flex items-center text-sm px-4 py-2 rounded-full 
                ${usedAssist || assistCount <= 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-black'}`}
            >
              🧠 Quick Assist ({assistCount} left)
            </button>
            <button
              onClick={() => setShowExitModal(true)}
              className="inline-flex items-center text-sm px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              🚪 End
            </button>
          </div>

          {/* Exit Confirmation Modal */}
          {showExitModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 text-white p-6 rounded-lg max-w-sm w-full shadow-lg">
                <h2 className="text-lg font-bold mb-4">⚠️ Exit Confirmation</h2>
                <p className="mb-4">Are you sure you want to exit? Your progress will be submitted and shown as final.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowExitModal(false)}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-black"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      clearInterval(timerRef.current!);
                      setEndTime(Date.now());
                      setShowResults(true);
                      setShowExitModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    End Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import savedWords from "./Words50.csv";
import { fetchPreviousWords } from "./api";

const VALID_LETTERS_PATTERN = /^[a-zA-Z]+$/;
const CSV_HEADER_INDEX = 1;

const App = () => {
  const [state, setState] = useState({
    word: "",
    score: 0,
    apiData: [],
    savedWordsList: {},
    error: "",
  });

  const fetchSavedWords = useCallback(() => {
    fetch(savedWords)
      .then((response) => response.text())
      .then((data) => {
        const savedWordsMap = {};

        // checking if input is valid and adding word to set if so
        data
          .split("\n")
          .slice(CSV_HEADER_INDEX)
          .forEach((line) => {
            const [word, score, date] = line.trim().toLowerCase().split(",");
            if (
              word &&
              VALID_LETTERS_PATTERN.test(word) &&
              word.split(" ").length === 1
            ) {
              savedWordsMap[word] = true;
            }
          });
          
        setState((prevState) => ({
          ...prevState,
          savedWordsList: savedWordsMap,
        }));
      })
      .catch((error) =>
        setState((prevState) => ({
          ...prevState,
          error: "Error loading saved words",
        }))
      );
  }, []);

  const fetchPreviousData = useCallback(() => {
    fetchPreviousWords()
      .then((data) => {
        // Filtering invalid entries
        const filteredData = data.filter(
          (entry) =>
            !isNaN(entry.score) &&
            entry.scoreDate &&
            !isNaN(
              Date.parse(entry.scoreDate)
            ) &&
                entry.word &&
                VALID_LETTERS_PATTERN.test(entry.word) &&
                entry.word.split(" ").length === 1
        );

        setState((prevState) => ({ ...prevState, apiData: filteredData }));
      })
      .catch((error) =>
        setState((prevState) => ({
          ...prevState,
          error: "Error fetching API data",
        }))
      );
  }, []);

  useEffect(() => {
    fetchSavedWords();
    fetchPreviousData();
  }, [fetchSavedWords, fetchPreviousData]);

  const handleInputChange = (e) => {
    setState((prevState) => ({ ...prevState, word: e.target.value }));
  };

  const calculateScore = useCallback(
    (inputWord) => {
      // Looping through characters in word and calculating score via ASCII value
      const baseScore = inputWord
        .toLowerCase()
        .split("")
        .reduce(
          (acc, char) =>
            acc + char.toLowerCase().charCodeAt(0) - "a".charCodeAt(0) + 1,
          0
        );
 
      // Checking if word is in savedWordsList set
      const isSpecialWord = state.savedWordsList.hasOwnProperty(
        inputWord.toLowerCase()
      );

      const finalScore = isSpecialWord ? baseScore * 2 : baseScore;

      setState((prevState) => ({ ...prevState, score: finalScore }));
    },
    [state.savedWordsList]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const { word } = state;

    // If spaces or more than one word in user input
    if (word.includes(" ") || word.split(" ").length > 1) {
      setState((prevState) => ({
        ...prevState,
        error: "Please enter a single word.",
      }));
      return;
    }

    // checking word only contains letters
    if (/[^a-zA-Z]/.test(word)) {
      setState((prevState) => ({
        ...prevState,
        error: "Please enter a valid word with only letters.",
      }));
      return;
    }

    setState((prevState) => ({ ...prevState, error: "" }));
    calculateScore(word);
  };

  const { word, score, apiData, error } = state;

  return (
    <div className="container">
      <header className="header">
        <h1>Scrabble Score Calculator</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={word}
            onChange={handleInputChange}
            placeholder="Enter a word"
            required
          />
          <button type="submit">
            Calculate Score
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <h2>Score: {score}</h2>

        {apiData.length > 0 && (
          <>
            <h2>Previous Words</h2>
            <ul>
              {apiData.map((entry, index) => (
                <li key={index} >
                  {entry.word} - {entry.score} (submitted on{" "}
                  {new Date(entry.scoreDate).toLocaleString()})
                </li>
              ))}
            </ul>
          </>
        )}
      </header>
    </div>
  );
};

export default App;

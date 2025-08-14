// src/components/LocationList.jsx
import { useState } from "react";

export default function LocationList({ hierarchy }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (path) =>
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));

  return (
    <div className="p-4 bg-gray-50 rounded-md max-w-xl mx-auto mt-4 shadow">
      {Object.keys(hierarchy).map((country) => (
        <div key={country}>
          <div
            className="cursor-pointer font-bold text-lg py-1"
            onClick={() => toggle(country)}
          >
            {expanded[country] ? "▼" : "▶"} {country}
          </div>

          {expanded[country] &&
            Object.keys(hierarchy[country]).map((state) => (
              <div key={state} className="ml-4">
                <div
                  className="cursor-pointer font-semibold py-1"
                  onClick={() => toggle(`${country}-${state}`)}
                >
                  {expanded[`${country}-${state}`] ? "▼" : "▶"} {state}
                </div>

                {expanded[`${country}-${state}`] &&
                  Object.keys(hierarchy[country][state]).map((city) => (
                    <div key={city} className="ml-4">
                      <div
                        className="cursor-pointer text-gray-700 py-1"
                        onClick={() => toggle(`${country}-${state}-${city}`)}
                      >
                        {expanded[`${country}-${state}-${city}`]
                          ? "▼"
                          : "▶"}{" "}
                        {city}
                      </div>

                      {expanded[`${country}-${state}-${city}`] &&
                        hierarchy[country][state][city].map((line) => (
                          <div
                            key={line.id}
                            className="ml-4 text-sm text-gray-500"
                          >
                            {line.name}
                          </div>
                        ))}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

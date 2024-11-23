import { Message, User } from "@/lib/constants";
import React, { useState } from "react";
import Plot from "react-plotly.js";
type WindowObject = Record<string, Window>;

function GraphPlot({
  msg,
  user,
  name,
}: {
  msg: Message;
  user: User;
  name: String;
}) {
  const [openedTab, setOpenedTab] = useState<WindowObject>({});
  const realTimePlotHandler = () => {
    const url = `/real-time-plot/${user.connectionId}?name=${user.name}`;
    try {
      if (
        !openedTab[user.connectionId] ||
        openedTab[user.connectionId].closed ||
        `/real-time-plot${
          openedTab[user.connectionId].location.href.split("real-time-plot")[1]
        }` !== url
      ) {
        const newTab = window.open(url, "_blank");
        if (newTab) {
          setOpenedTab((prev) => ({
            ...prev,
            [user.connectionId]: newTab,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="flex flex-col items-center bg-white  shadow-md">
      {user && (
        <div className="flex justify-between mt-5 w-[80%] items-center">
          <div className="flex flex-col font-bold text-[20px]">
            <h4>
              Name: {user.name.split("@")[0].replace(".", " ").toUpperCase()}
            </h4>
            <h5>Email: {user.email}</h5>
          </div>
          {name.length === 0 && (
            <button
              className="p-3 bg-gray-800 text-white rounded-[10px]"
              onClick={realTimePlotHandler}
            >
              Realtime plot
            </button>
          )}
        </div>
      )}

      {msg.timeStamp.length > 0 ? (
        <Plot
          data={[
            {
              x: msg.timeStamp,
              y: msg.forcasted,
              type: "scatter",
              name: "Forcasted",
            },
            {
              x: msg.timeStamp,
              y: msg.produced,
              type: "scatter",
              name: "Produced",
            },
          ]}
          layout={{
            showlegend: true,
            autosize: true,
            legend: {
              x: 0.75,
              y: 1.2,
            },
            yaxis: { title: "Electricity" },
            yaxis2: {
              title: "yaxis2 title",
              titlefont: { color: "rgb(148, 103, 189)" },
              tickfont: { color: "rgb(148, 103, 189)" },

              overlaying: "y",
              side: "right",
            },
          }}
          useResizeHandler={true}
          className="font-bold mt-5 w-[100%] h-[100%]"
        />
      ) : (
        <div className="text-2xl text-[20px] text-red-600 py-10">
          No data found for this client
        </div>
      )}
    </div>
  );
}

export default GraphPlot;

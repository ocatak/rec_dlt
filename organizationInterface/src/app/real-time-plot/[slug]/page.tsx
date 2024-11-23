"use client";
import React, { useEffect, useState } from "react";
import "chart.js/auto";
import Plot from "react-plotly.js";
import { useRouter, useSearchParams } from "next/navigation";
import { Notification } from "@/components/notifier";
import axios from "axios";

const RealTimePlot: React.FC<any> = ({
  params,
}: {
  params: { slug: string };
}) => {
  const name = useSearchParams().get("name");
  const [msg, setMsg] = useState<{
    timeStamp: Date[];
    produced: number[];
    forcasted: number[];
  }>({
    timeStamp: [],
    produced: [],
    forcasted: [],
  });

  const getData = async (connectionId: string) => {
    try {
      const response = await axios.get(`/api/agent/client/realtime-data/${connectionId}`) ;
      return response.data.response
    } catch (error) {
      console.error('Error fetching data for this client:', error);
      if (axios.isAxiosError(error)) {
        Notification({
          type: "error",
          title: "Failed to fetch data for this client",
          text: error.response?.data?.message || "An unexpected error occurred.",
        });
      } else {
        Notification({
          type: "error",
          title: "Failed to fetch data for this client",
          text: "An unexpected error occurred while fetching data for this client.",
        });
      }
    }
  };

  // const dataHandler = async (id: string) => {
  //   const res = await realTimeDataFetcher(id);
  //   console.log(res)
  //   if (res.production !== 0 && res.timestamp !== 0) {
  //     return res;
  //   }
  //   return { production: 0, timestamp: 0, forcasted: 0};
  // };

  const setDefault = async (id: string) => {
    try {
      const realTime = await getData(id);
      if (realTime.production !== 0 && realTime.timestamp !== 0) {
        setMsg((prev) => {
          
          const x1 = [...prev.timeStamp, new Date(realTime.timestamp)];
          const y1 = [...prev.produced, realTime.production];
          const z1 = [...prev.forcasted, realTime.forcasted];
          return {
            timeStamp: x1,
            produced: y1,
            forcasted: z1,
          };
        });
      } else {
        setMsg(() => {
          return {
            timeStamp: [],
            produced: [],
            forcasted: [],
          };
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setDefault(params.slug);

    const interval = setInterval(async () => {
      try {
        const realTime = await getData(params.slug);
        if (realTime.production !== 0 && realTime.timestamp !== 0) {
          setMsg((prev) => {            
            const x1 = [...prev.timeStamp, new Date(realTime.timestamp)];
            const y1 = [...prev.produced, realTime.production];
            const z1 = [...prev.forcasted, realTime.forcasted];

            return {
              timeStamp: x1,
              produced: y1,
              forcasted: z1,
            };
          });
        }
      } catch (error) {
        console.log(error);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [params.slug]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      
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
          title: `${name}'s real-time data`,
          autosize: true,
          showlegend: true,
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
        useResizeHandler = {true}
        className="font-bold mt-5 w-[90%] h-[90%]"
      />
    </div>
  );
};

export default RealTimePlot;

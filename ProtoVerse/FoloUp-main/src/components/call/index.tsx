"use client";

import {
  ArrowUpRightSquareIcon,
  AlarmClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  VideoIcon,
  VideoOffIcon,
  Code2,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useResponses } from "@/contexts/responses.context";
import Image from "next/image";
import axios from "axios";
import { RetellWebClient } from "retell-client-js-sdk";
import MiniLoader from "../loaders/mini-loader/miniLoader";
import { toast } from "sonner";
import { isLightColor, testEmail } from "@/lib/utils";
import { ResponseService } from "@/services/responses.service";
import { Interview } from "@/types/interview";
import { FeedbackData } from "@/types/response";
import { FeedbackService } from "@/services/feedback.service";
import { FeedbackForm } from "@/components/call/feedbackForm";
import { SecurityAnalysis } from "@/components/call/securityAnalysis";
import { CodeEditor } from "@/components/call/codeEditorNew";
import {
  TabSwitchWarning,
  useTabSwitchPrevention,
} from "./tabSwitchPrevention";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { InterviewerService } from "@/services/interviewers.service";

const webClient = new RetellWebClient();

type InterviewProps = {
  interview: Interview;
};

type registerCallResponseType = {
  data: {
    registerCallResponse: {
      call_id: string;
      access_token: string;
    };
  };
};

type transcriptType = {
  role: string;
  content: string;
};

function Call({ interview }: InterviewProps) {
  const { createResponse } = useResponses();
  const [lastInterviewerResponse, setLastInterviewerResponse] =
    useState<string>("");
  const [lastUserResponse, setLastUserResponse] = useState<string>("");
  const [activeTurn, setActiveTurn] = useState<string>("");
  const [Loading, setLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [isOldUser, setIsOldUser] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const { tabSwitchCount } = useTabSwitchPrevention();
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [showSecurityAnalysis, setShowSecurityAnalysis] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interviewerImg, setInterviewerImg] = useState("");
  const [interviewTimeDuration, setInterviewTimeDuration] =
    useState<string>("1");
  const [time, setTime] = useState(0);
  const [currentTimeDuration, setCurrentTimeDuration] = useState<string>("0");
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState<boolean>(false);
  const [isCodingRound, setIsCodingRound] = useState<boolean>(false);
  const [codingRoundTime, setCodingRoundTime] = useState<number>(0);
  const [codingRoundDuration, setCodingRoundDuration] = useState<number>(45); // 45 mins default

  const lastUserResponseRef = useRef<HTMLDivElement | null>(null);

  const handleEndCodingRound = () => {
    setIsCodeEditorOpen(false);
    setIsCodingRound(false);
    setIsEnded(true); // Now show the thank you screen
  };

  const handleFeedbackSubmit = async (
    formData: Omit<FeedbackData, "interview_id">,
  ) => {
    try {
      const result = await FeedbackService.submitFeedback({
        ...formData,
        interview_id: interview.id,
      });

      if (result) {
        toast.success("Thank you for your feedback!");
        setIsFeedbackSubmitted(true);
        setIsDialogOpen(false);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("An error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (lastUserResponseRef.current) {
      const { current } = lastUserResponseRef;
      current.scrollTop = current.scrollHeight;
    }
  }, [lastUserResponse]);

  useEffect(() => {
    let intervalId: any;
    if (isCalling) {
      intervalId = setInterval(() => setTime(time + 1), 10);
    }
    setCurrentTimeDuration(String(Math.floor(time / 100)));
    if (Number(currentTimeDuration) == Number(interviewTimeDuration) * 60) {
      console.log("Interview time ended, stopping call...");
      webClient.stopCall();
      // Don't set isEnded yet - wait for coding round to complete
      // Auto-transition to coding round after interview ends
      console.log("Transitioning to coding round in 2 seconds...");
      setTimeout(() => {
        console.log("Opening coding round now!");
        setIsCodingRound(true);
        setIsCodeEditorOpen(true);
      }, 2000);
    }

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalling, time, currentTimeDuration]);

  // Coding round timer
  useEffect(() => {
    let intervalId: any;
    if (isCodingRound && isCodeEditorOpen) {
      intervalId = setInterval(() => {
        setCodingRoundTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isCodingRound, isCodeEditorOpen]);

  useEffect(() => {
    if (testEmail(email)) {
      setIsValidEmail(true);
    }
  }, [email]);

  useEffect(() => {
    webClient.on("call_started", () => {
      console.log("Call started");
      setIsCalling(true);
    });

    webClient.on("call_ended", () => {
      console.log("Call ended - preparing for coding round");
      setIsCalling(false);
      // Don't set isEnded here - let the coding round complete first
    });

    webClient.on("agent_start_talking", () => {
      setActiveTurn("agent");
    });

    webClient.on("agent_stop_talking", () => {
      // Optional: Add any logic when agent stops talking
      setActiveTurn("user");
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      webClient.stopCall();
      setIsEnded(true);
      setIsCalling(false);
    });

    webClient.on("update", (update) => {
      if (update.transcript) {
        const transcripts: transcriptType[] = update.transcript;
        const roleContents: { [key: string]: string } = {};

        transcripts.forEach((transcript) => {
          roleContents[transcript?.role] = transcript?.content;
        });

        setLastInterviewerResponse(roleContents["agent"]);
        setLastUserResponse(roleContents["user"]);

        // Lightweight local assistant for camera status questions
        try {
          const userSaid = (roleContents["user"] || "").toLowerCase();
          const askedCamera = /\b(camera|video)\b.*\b(on|off|working|enabled)\b|\bis my camera on\b/.test(userSaid);
          if (askedCamera) {
            if (isCameraOn) {
              setLastInterviewerResponse("Yes, your camera is on and working.");
            } else {
              setLastInterviewerResponse("Your camera is currently off.");
            }
          }
        } catch (_) {
          // no-op
        }
      }
      //TODO: highlight the newly uttered word in the UI
    });

    return () => {
      // Clean up event listeners
      webClient.removeAllListeners();
      // Stop camera if active
      if (videoStream) {
        videoStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Ensure the <video> element receives the stream and starts playing
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      const play = async () => {
        try {
          await videoRef.current?.play();
        } catch (e) {
          // Some browsers need interaction; ignore
        }
      };
      videoRef.current.onloadedmetadata = play;
      void play();
    }
  }, [videoStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      setVideoStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  const onEndCallClick = async () => {
    if (isStarted) {
      setLoading(true);
      webClient.stopCall();
      setLoading(false);
      // Transition to coding round instead of ending immediately
      setTimeout(() => {
        console.log("Manual call end - opening coding round");
        setIsCodingRound(true);
        setIsCodeEditorOpen(true);
      }, 1000);
    } else {
      setIsEnded(true);
    }
  };

  const startConversation = async () => {
    const data = {
      mins: interview?.time_duration,
      objective: interview?.objective,
      questions: interview?.questions.map((q) => q.question).join(", "),
      name: name || "not provided",
    };
    setLoading(true);

    const oldUserEmails: string[] = (
      await ResponseService.getAllEmails(interview.id)
    ).map((item) => item.email);
    const OldUser =
      oldUserEmails.includes(email) ||
      (interview?.respondents && !interview?.respondents.includes(email));

    if (OldUser) {
      setIsOldUser(true);
    } else {
      const registerCallResponse: registerCallResponseType = await axios.post(
        "/api/register-call",
        { dynamic_data: data, interviewer_id: interview?.interviewer_id },
      );
      if (registerCallResponse.data.registerCallResponse.access_token) {
        await webClient
          .startCall({
            accessToken:
              registerCallResponse.data.registerCallResponse.access_token,
          })
          .catch(console.error);
        setIsCalling(true);
        setIsStarted(true);

        setCallId(registerCallResponse?.data?.registerCallResponse?.call_id);

        const response = await createResponse({
          interview_id: interview.id,
          call_id: registerCallResponse.data.registerCallResponse.call_id,
          email: email,
          name: name,
        });

        // Try to start camera after call begins
        startCamera();
      } else {
        console.log("Failed to register call");
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (interview?.time_duration) {
      setInterviewTimeDuration(interview?.time_duration);
    }
  }, [interview]);

  useEffect(() => {
    const fetchInterviewer = async () => {
      const interviewer = await InterviewerService.getInterviewer(
        interview.interviewer_id,
      );
      setInterviewerImg(interviewer.image);
    };
    fetchInterviewer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interview.interviewer_id]);

  useEffect(() => {
    if (isEnded) {
      const updateInterview = async () => {
        await ResponseService.saveResponse(
          { is_ended: true, tab_switch_count: tabSwitchCount },
          callId,
        );
      };

      updateInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {isStarted && <TabSwitchWarning />}
      <div className="bg-white rounded-md md:w-[80%] w-[90%]">
        <Card className="h-[88vh] rounded-lg border-2 border-b-4 border-r-4 border-black text-xl font-bold transition-all  md:block dark:border-white ">
          <div>
            <div className="m-4 h-[15px] rounded-lg border-[1px]  border-black">
              <div
                className=" bg-indigo-600 h-[15px] rounded-lg"
                style={{
                  width: isEnded
                    ? "100%"
                    : `${
                        (Number(currentTimeDuration) /
                          (Number(interviewTimeDuration) * 60)) *
                        100
                      }%`,
                }}
              />
            </div>
            <CardHeader className="items-center p-1">
              {!isEnded && (
                <div className="flex flex-row items-center justify-center w-full relative">
                  <CardTitle className="text-lg md:text-xl font-bold mb-2">
                    {interview?.name}
                  </CardTitle>
                  {isStarted && !isEnded && !isOldUser && (
                    <Button
                      onClick={() => setIsCodeEditorOpen(true)}
                      className="absolute right-4 top-0 bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-sm"
                    >
                      <Code2 className="h-4 w-4 mr-1" />
                      Code Editor
                    </Button>
                  )}
                </div>
              )}
              {!isEnded && (
                <div className="flex mt-2 flex-row">
                  <AlarmClockIcon
                    className="text-indigo-600 h-[1rem] w-[1rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 mr-2 font-bold"
                    style={{ color: interview.theme_color }}
                  />
                  <div className="text-sm font-normal">
                    Expected duration:{" "}
                    <span
                      className="font-bold"
                      style={{ color: interview.theme_color }}
                    >
                      {interviewTimeDuration} mins{" "}
                    </span>
                    or less
                  </div>
                </div>
              )}
            </CardHeader>
            {!isStarted && !isEnded && !isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50">
                <div>
                  {interview?.logo_url && (
                    <div className="p-1 flex justify-center">
                      <Image
                        src={interview?.logo_url}
                        alt="Logo"
                        className="h-10 w-auto"
                        width={100}
                        height={100}
                      />
                    </div>
                  )}
                  <div className="p-2 font-normal text-sm mb-4 whitespace-pre-line">
                    {interview?.description}
                    <p className="font-bold text-sm">
                      {"\n"}Ensure your volume is up and grant microphone access
                      when prompted. Additionally, please make sure you are in a
                      quiet environment.
                      {"\n\n"}Note: Tab switching will be recorded.
                    </p>
                  </div>
                  {!interview?.is_anonymous && (
                    <div className="flex flex-col gap-2 justify-center">
                      <div className="flex justify-center">
                        <input
                          value={email}
                          className="h-fit mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your email address"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <input
                          value={name}
                          className="h-fit mb-4 mx-auto py-2 border-2 rounded-md w-[75%] self-center px-2 border-gray-400 text-sm font-normal"
                          placeholder="Enter your first name"
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-[80%] flex flex-row mx-auto justify-center items-center align-middle">
                  <Button
                    className="min-w-20 h-10 rounded-lg flex flex-row justify-center mb-8"
                    style={{
                      backgroundColor: interview.theme_color ?? "#4F46E5",
                      color: isLightColor(interview.theme_color ?? "#4F46E5")
                        ? "black"
                        : "white",
                    }}
                    disabled={
                      Loading ||
                      (!interview?.is_anonymous && (!isValidEmail || !name))
                    }
                    onClick={startConversation}
                  >
                    {!Loading ? "Start Interview" : <MiniLoader />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button
                        className="bg-white border ml-2 text-black min-w-15 h-10 rounded-lg flex flex-row justify-center mb-8"
                        style={{ borderColor: interview.theme_color }}
                        disabled={Loading}
                      >
                        Exit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-indigo-600 hover:bg-indigo-800"
                          onClick={async () => {
                            await onEndCallClick();
                          }}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="flex flex-row p-2 grow">
                <div className="border-x-2 border-grey w-[50%] my-auto min-h-[70%]">
                  <div className="flex flex-col justify-evenly">
                    <div
                      className={`text-[22px] w-[80%] md:text-[26px] mt-4 min-h-[250px] mx-auto px-6`}
                    >
                      {lastInterviewerResponse}
                    </div>
                    <div className="flex flex-col mx-auto justify-center items-center align-middle">
                      <Image
                        src={interviewerImg}
                        alt="Image of the interviewer"
                        width={120}
                        height={120}
                        className={`object-cover object-center mx-auto my-auto ${
                          activeTurn === "agent"
                            ? `border-4 border-[${interview.theme_color}] rounded-full`
                            : ""
                        }`}
                      />
                      <div className="font-semibold">Interviewer</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between w-[50%] h-full py-4">
                  <div
                    ref={lastUserResponseRef}
                    className={`text-[22px] w-[80%] md:text-[26px] mx-auto h-[200px] px-6 overflow-y-auto flex-shrink-0`}
                  >
                    {lastUserResponse}
                  </div>
                  <div className="flex flex-col mx-auto justify-center items-center align-middle mt-4">
                    {isCameraOn ? (
                      <div
                        className="bg-black rounded-md overflow-hidden flex items-center justify-center shadow-sm border"
                        style={{ width: "min(75%, 240px)", aspectRatio: "4 / 3" }}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${
                            activeTurn === "user" ? `ring-4 ring-[${interview.theme_color}]` : ""
                          }`}
                          style={{ transform: "scaleX(-1)" }}
                        />
                      </div>
                    ) : (
                      <Image
                        src={`/user-icon.png`}
                        alt="Picture of the user"
                        width={120}
                        height={120}
                        className={`object-cover object-center mx-auto my-auto ${
                          activeTurn === "user"
                            ? `border-4 border-[${interview.theme_color}] rounded-full`
                            : ""
                        }`}
                      />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          isCameraOn
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        Camera: {isCameraOn ? "On" : "Off"}
                      </span>
                      {!isCameraOn ? (
                        <Button
                          className="bg-indigo-600 text-white h-8 px-3"
                          onClick={startCamera}
                        >
                          <VideoIcon className="h-4 w-4 mr-1" /> Turn Camera On
                        </Button>
                      ) : (
                        <Button
                          className="bg-white border text-black h-8 px-3"
                          style={{ borderColor: interview.theme_color }}
                          onClick={stopCamera}
                        >
                          <VideoOffIcon className="h-4 w-4 mr-1" /> Turn Camera Off
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isStarted && !isEnded && !isOldUser && (
              <div className="items-center p-2">
                <AlertDialog>
                  <AlertDialogTrigger className="w-full">
                    <Button
                      className=" bg-white text-black border  border-indigo-600 h-10 mx-auto flex flex-row justify-center mb-8"
                      disabled={Loading}
                    >
                      End Interview{" "}
                      <XCircleIcon className="h-[1.5rem] ml-2 w-[1.5rem] rotate-0 scale-100  dark:-rotate-90 dark:scale-0 text-red" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This action will end the
                        call.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-indigo-600 hover:bg-indigo-800"
                        onClick={async () => {
                          await onEndCallClick();
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}

            {isEnded && !isOldUser && (
              <div className="w-fit min-w-[500px] max-w-[600px] mx-auto mt-2 border border-indigo-200 rounded-md p-2 m-2 bg-slate-50 absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  {!showSecurityAnalysis && !isFeedbackSubmitted && (
                    <>
                      <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                        <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                        <p className="text-lg font-semibold text-center">
                          {isStarted
                            ? `Thank you for taking the time to participate in this interview`
                            : "Thank you very much for considering."}
                        </p>
                      </div>
                      <div className="flex gap-2 px-4 pb-4">
                        <Button
                          className="flex-1 bg-indigo-600 text-white h-10"
                          onClick={() => setShowSecurityAnalysis(true)}
                        >
                          Run Security Analysis
                        </Button>
                        <Button
                          className="flex-1 bg-white border border-indigo-600 text-indigo-600 h-10"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Skip to Feedback
                        </Button>
                      </div>
                    </>
                  )}

                  {showSecurityAnalysis && !isFeedbackSubmitted && (
                    <SecurityAnalysis
                      email={email}
                      onComplete={() => {
                        setShowSecurityAnalysis(false);
                        setIsDialogOpen(true);
                      }}
                    />
                  )}

                  {!showSecurityAnalysis && !isFeedbackSubmitted && (
                    <AlertDialog
                      open={isDialogOpen}
                      onOpenChange={setIsDialogOpen}
                    >
                      <AlertDialogContent>
                        <FeedbackForm
                          email={email}
                          onSubmit={handleFeedbackSubmit}
                        />
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {isFeedbackSubmitted && (
                    <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                      <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500" />
                      <p className="text-lg font-semibold text-center">
                        Thank you for your feedback!
                      </p>
                      <p className="text-center">
                        {"\n"}
                        You can close this tab now.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {isOldUser && (
              <div className="w-fit min-w-[400px] max-w-[400px] mx-auto mt-2  border border-indigo-200 rounded-md p-2 m-2 bg-slate-50  absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div>
                  <div className="p-2 font-normal text-base mb-4 whitespace-pre-line">
                    <CheckCircleIcon className="h-[2rem] w-[2rem] mx-auto my-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-indigo-500 " />
                    <p className="text-lg font-semibold text-center">
                      You have already responded in this interview or you are
                      not eligible to respond. Thank you!
                    </p>
                    <p className="text-center">
                      {"\n"}
                      You can close this tab now.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Code Editor Modal */}
      <CodeEditor
        isOpen={isCodeEditorOpen}
        onClose={() => {
          setIsCodeEditorOpen(false);
          if (isCodingRound) {
            setIsCodingRound(false);
          }
        }}
        themeColor={interview.theme_color}
        isCodingRound={isCodingRound}
        codingRoundTime={codingRoundTime}
        codingRoundDuration={codingRoundDuration}
        onEndCodingRound={() => {
          setIsCodingRound(false);
          setIsCodeEditorOpen(false);
          setIsEnded(true); // Show thank you screen after coding round ends
          toast.success("Coding round completed!");
        }}
      />
    </div>
  );
}

export default Call;

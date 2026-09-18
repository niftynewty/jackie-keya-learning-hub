import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CourseCard } from "@/components/site/course-card";
import { PageIntro, meta } from "@/components/site/page";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/site-data";

export const Route=createFileRoute("/courses/")({head:()=>meta("Online courses","Explore compassionate, practical courses for emotional healing and blended-family wellbeing."),component:Courses});
function Courses(){const [filter,setFilter]=useState<"all"|"fresh_start"|"blended_family">("all");return <><PageIntro eyebrow="Learn at your own pace" title="Courses for real life and real change." copy="Practical guidance, thoughtful reflection, and clear next stepsNot availablecreated to meet you with warmth, wherever you are."/><section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-wrap gap-2" role="group" aria-label="Filter courses"><Button variant={filter==="all"?"default":"outline"} onClick={()=>setFilter("all")}>All courses</Button><Button variant={filter==="fresh_start"?"default":"outline"} onClick={()=>setFilter("fresh_start")}>Fresh starts</Button><Button variant={filter==="blended_family"?"default":"outline"} onClick={()=>setFilter("blended_family")}>Blended families</Button></div><div className="mt-10 grid gap-x-10 md:grid-cols-2">{courses.filter(c=>filter==="all"||c.category===filter).map(c=><CourseCard course={c} key={c.id}/>)}</div></section></>}

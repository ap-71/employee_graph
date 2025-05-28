import Departments from "./Departments";
import Positions from "./Positions";
import Employee from "./Employee";
import Projects from "./Projects";
import { Section } from "./Section";

export default function Management() {
  return (
    <>
      <Section name="Разделы" buttonName="Добавить раздел"/>
      {/* <Section name="Отделы, должности и сотрудники">
        <Employee />
        <Departments />
        <Positions />
        <Projects />
      </Section> */}
    </>
  );
}

import Departments from './Departments';
import Positions from './Positions';
import Employee from './Employee';
import Projects from './Projects';


export default function Management() {
    return <>
        <Employee />
        <Departments />
        <Positions />
        <Projects />
    </>
}
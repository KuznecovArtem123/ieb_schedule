import Groups from './pages/Groups';
import Edu from './pages/Edu';
import Layout from './Layout';
import NotFound from './pages/NotFound';
import { Routes, Route } from 'react-router-dom';
import Teachers from './pages/Teachers';
import Schedule from './pages/Schedule';
import TeacherSchedule from './pages/TeacherSchedule';

function App() {
  return (
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path='/' element={<Edu></Edu>}></Route>
        <Route path='/edu/:category' element={<Groups></Groups>}></Route>
        <Route path='/schedule/:id' element={<Schedule></Schedule>}></Route>
        <Route path='/teacher/:id' element={<TeacherSchedule></TeacherSchedule>}></Route>
        <Route path='/teachers' element={<Teachers></Teachers>}></Route>
        <Route path="*" element={<NotFound/>} />
      </Route>
    </Routes>
  );
}

export default App;

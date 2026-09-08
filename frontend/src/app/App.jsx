import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';

import EduPage from '../pages/EduPage';
import GroupsPage from '../pages/GroupsPage';
import SchedulePage from '../pages/SchedulePage';
import TeachersPage from '../pages/TeachersPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path='/' element={<EduPage/>}></Route>
        <Route path='/edu/:category' element={<GroupsPage/>}></Route>
        <Route path='/schedule/:id' element={<SchedulePage/>}></Route>
        <Route path='/teacher/:id' element={<SchedulePage/>}></Route>
        <Route path='/teachers' element={<TeachersPage/>}></Route>
        <Route path='/settings' element={<SettingsPage/>}></Route>
        <Route path="*" element={<NotFoundPage/>} />
      </Route>
    </Routes>
  );
}

export default App;

import Groups from './pages/Groups';
import Edu from './pages/Edu';
import Lessons from './pages/Lessons';
import Layout from './Layout';
import NotFound from './pages/NotFound';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route element={<Layout></Layout>}>
        <Route path='/' element={<Edu></Edu>}></Route>
        <Route path='/edu/:category' element={<Groups></Groups>}></Route>
        <Route path='/schedule/:id' element={<Lessons></Lessons>}></Route>
        <Route path="*" element={<NotFound/>} />
      </Route>
    </Routes>
  );
}

export default App;

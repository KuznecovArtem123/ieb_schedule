import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h2>404</h2>
      <h2>Страница не найдена</h2>
      <Link className='redirect_button' to="/">Вернуться на главную</Link>
    </div>
  );
}
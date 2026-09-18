import BasicButton from '@/shared/ui/BasicButton';

export default function NotFoundPage() {
  return (
    <div>
      <h2>404</h2>
      <h2>Страница не найдена</h2>
      <BasicButton to="/">Вернуться на главную</BasicButton>
    </div>
  );
}
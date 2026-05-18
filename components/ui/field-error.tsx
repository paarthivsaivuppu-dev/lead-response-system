type FieldErrorProps = {
  id: string;
  message?: string;
};

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-sm font-medium text-rose-700" id={id}>
      {message}
    </p>
  );
}

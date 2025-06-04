export function PopupLoader() {
  return (
    <div className="flex flex-col items-center">
      <img src="/loading.gif" alt="loading" className="my-[-2rem]" />
      <h1 className="mb-4 mt-4 text-center text-2xl font-semibold">
        Checking your emails...
      </h1>
    </div>
  );
}

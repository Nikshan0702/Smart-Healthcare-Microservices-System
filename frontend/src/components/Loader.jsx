function Loader({ label = "Loading...", fullPage = false }) {
  return (
    <div className={fullPage ? "loader-wrap full-page" : "loader-wrap"}>
      <div className="loader" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;

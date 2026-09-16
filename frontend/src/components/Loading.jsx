export default function Loading({ label = 'Cargando...' }) {
  return (
    <div className="loading-state" role="status">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}

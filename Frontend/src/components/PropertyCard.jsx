function PropertyCard({ property }) {
  return (
    <article className="property-card">
      <img
        src={property.image}
        alt={property.title}
        className="property-image"
      />

      <div className="property-info">
        <h3>{property.title}</h3>
        <p>{property.location}</p>
        <p>R{property.price} night</p>
      </div>
    </article>
  );
}

export default PropertyCard;

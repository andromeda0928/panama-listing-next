// src/pages/[id].js
import Head from 'next/head';
import Link from 'next/link';

/* ----------  STATIC PATHS  ---------- */
export async function getStaticPaths() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    AIRTABLE_TABLE_NAME,
  )}`;

  const r = await fetch(`${api}?pageSize=100`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  const { records } = await r.json();

  return {
    paths: records.map(rec => ({ params: { id: rec.id } })),
    fallback: 'blocking',
  };
}

/* ----------  STATIC PROPS  ---------- */
export async function getStaticProps({ params }) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
    AIRTABLE_TABLE_NAME,
  )}`;

  const res = await fetch(`${api}/${params.id}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  if (!res.ok) return { notFound: true };

  return {
    props: { record: await res.json() },
    revalidate: 60,
  };
}

/* ----------  PAGE  ---------- */
export default function Detail({ record }) {
  const f = record?.fields || {};

  /* --------  NORMALIZAR url_img -------- */
  let filenames = [];
  if (Array.isArray(f.url_img)) {
    filenames = f.url_img.map(s => String(s).trim()).filter(Boolean);
  } else if (typeof f.url_img === 'string') {
    filenames = f.url_img.split(',').map(s => s.trim()).filter(Boolean);
  }
  /* ------------------------------------- */

  const base      = 'https://panama-green.com/wp-content/uploads/wpallimport/files';
  const imageUrls = filenames.map(name => `${base}/${name}`);
  const ogImage   = imageUrls[0] || '';

  const pageUrl   = `https://tu-dominio.com/${record.id}`;
  const shareText = encodeURIComponent(
    `${f.street_name || ''} – $${(f.price_current || 0).toLocaleString()}\n${pageUrl}`,
  );

  return (
    <>
      <Head>
        <title>{f.street_name || 'Detalle de Propiedad'}</title>
        <meta name="description" content={f.remarks_es || f.remarks || ''} />
        <meta property="og:title"       content={f.street_name || ''} />
        <meta property="og:description" content={f.remarks_es || f.remarks || ''} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url"         content={pageUrl} />
        <meta name="twitter:card"       content="summary_large_image" />
      </Head>

      <main>
        <Link href="/" className="back-link">← Volver al catálogo</Link>
        <h1>{f.street_name}</h1>

        <div className="gallery">
          {imageUrls.map(url => (
            <img key={url} src={url} alt={f.street_name} />
          ))}
        </div>

        <section className="info-grid">
          <div><strong>Precio:</strong> ${f.price_current?.toLocaleString() || '—'}</div>
          <div><strong>Subdivisión:</strong> {f.subdivision || '—'}</div>
          <div><strong>Región:</strong> {f.region || '—'}</div>
          <div><strong>Distrito:</strong> {f.district || '—'}</div>
          <div><strong>Área:</strong> {f.map_area || '—'}</div>
          <div><strong>Tipo:</strong> {f.property_type || '—'}</div>
          <div><strong>Año:</strong> {f.year_built || '—'}</div>
          <div><strong>Recámaras:</strong> {f.bedrooms ?? '—'}</div>
          <div><strong>Baños completos:</strong> {f.bathrooms ?? '—'}</div>
          <div><strong>Medios baños:</strong> {f.half_bathrooms ?? '—'}</div>
          <div><strong>Habitaciones:</strong> {f.number_of_rooms ?? '—'}</div>
          <div><strong>Lote:</strong> {f.lot_sqft ?? '—'} ft²</div>
          <div><strong>Construcción:</strong> {f.sqft_total ?? '—'} ft²</div>
          <div><strong>Estilo:</strong> {f.style || '—'}</div>
          <div><strong>Remodelado:</strong> {f.remodelled || '—'}</div>
          <div><strong>Posesión:</strong> {f.possession || '—'}</div>
          <div><strong>Zonificación:</strong> {f.zoning || '—'}</div>
          <div><strong>Estado:</strong> {f.status || '—'}</div>
        </section>

        <section className="features">
          <h2>Características</h2>
          <p><strong>Interior:</strong> {f.interior_features || '—'}</p>
          <p><strong>Exterior:</strong> {f.exterior_features || '—'}</p>
          <p><strong>Servicios:</strong> {Array.isArray(f.other_services)
            ? f.other_services.join(', ')
            : (f.other_services || '—')}
          </p>
          <p><strong>Otras:</strong> {Array.isArray(f.internal_features)
            ? f.internal_features.join(', ')
            : (f.internal_features || '—')}
          </p>
        </section>

        <section className="remarks">
          <h2>Descripción</h2>
          <p>{f.remarks_es || f.remarks || '—'}</p>
        </section>

        <a
          href={`https://api.whatsapp.com/send?text=${shareText}`}
          className="btn-share"
          target="_blank"
          rel="noopener"
        >
          Compartir por WhatsApp
        </a>
      </main>

      <style jsx>{`
        main {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          font-family: Arial, sans-serif;
        }
        .back-link {
          display: inline-block;
          margin: 1rem 0;
          color: #2a9d8f;
        }
        h1 { text-align: center; margin-bottom: 1rem; }
        .gallery {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 4px;
        }
        .gallery img {
          width: 100%;
          height: 150px;
          object-fit: cover;
          border-radius: 4px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .5rem 1rem;
          padding: 1rem 0;
          border-top: 1px solid #eee;
        }
        .features, .remarks {
          padding: 1rem 0;
          border-top: 1px solid #eee;
        }
        .btn-share {
          display: inline-block;
          margin: 1rem 0 2rem;
          padding: .75rem 1.25rem;
          background: #25D366;
          color: #fff;
          border-radius: 4px;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}

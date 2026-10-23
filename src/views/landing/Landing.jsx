import { Link } from 'react-router-dom'
import { CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, CButton, CCol, CContainer, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight, cilCheckCircle } from '@coreui/icons'
import logoHorizontal from '../../assets/brand/logo-horizontal.png'
import logoIcon from '../../assets/brand/logo-icon.png'
import { CONTACT, FAQ, HERO, HIGHLIGHTS, ROOMS, SERVICES, STEPS } from './content'
import './landing.css'

const SECTIONS = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'habitaciones', label: 'Habitaciones' },
  { id: 'como-funciona', label: 'Cómo funciona' },
  { id: 'preguntas', label: 'Preguntas' },
]

export default function Landing() {
  return (
    <div className="landing">
      <LandingNav />
      <Hero />
      <Highlights />
      <Services />
      <Rooms />
      <Steps />
      <Faq />
      <CallToAction />
      <Footer />
    </div>
  )
}

function LandingNav() {
  return (
    <header className="landing-nav">
      <CContainer className="d-flex align-items-center gap-3">
        <a href="#top" className="me-auto">
          <img src={logoHorizontal} alt="Guau & Miau Club" height={44} />
        </a>
        <nav className="d-none d-lg-flex gap-4" aria-label="Secciones">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="landing-nav-link">
              {section.label}
            </a>
          ))}
        </nav>
        <CButton color="primary" variant="ghost" as={Link} to="/login" className="d-none d-sm-inline-block">
          Iniciar sesión
        </CButton>
        <CButton color="primary" as={Link} to="/registro">
          Crear cuenta
        </CButton>
      </CContainer>
    </header>
  )
}

function Hero() {
  return (
    <section className="landing-hero" id="top">
      <CContainer>
        <CRow className="align-items-center g-5">
          <CCol lg={6}>
            <span className="landing-eyebrow">{HERO.eyebrow}</span>
            <h1 className="landing-hero-title">
              {HERO.title} <span className="landing-highlight">{HERO.highlight}</span>
            </h1>
            <p className="landing-lead">{HERO.text}</p>
            <div className="d-flex flex-wrap gap-3">
              <CButton color="primary" size="lg" as={Link} to="/registro">
                Reservar ahora
                <CIcon icon={cilArrowRight} className="ms-2" />
              </CButton>
              <CButton color="primary" variant="outline" size="lg" as={Link} to="/login">
                Ya tengo cuenta
              </CButton>
            </div>
          </CCol>
          <CCol lg={6}>
            <div className="landing-hero-art">
              <div className="landing-blob" aria-hidden="true" />
              <img src={logoIcon} alt="" className="landing-hero-logo" />
              {HERO.badges.map((badge, index) => (
                <span key={badge.label} className={`landing-float landing-float-${index + 1}`}>
                  <CIcon icon={badge.icon} />
                  {badge.label}
                </span>
              ))}
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </section>
  )
}

function Highlights() {
  return (
    <section className="landing-highlights">
      <CContainer>
        <CRow className="g-4">
          {HIGHLIGHTS.map((item) => (
            <CCol key={item.title} sm={6} lg={3}>
              <div className="landing-highlight-item">
                <span className="landing-icon-bubble">
                  <CIcon icon={item.icon} size="lg" />
                </span>
                <div>
                  <div className="fw-bold">{item.title}</div>
                  <div className="small opacity-75">{item.text}</div>
                </div>
              </div>
            </CCol>
          ))}
        </CRow>
      </CContainer>
    </section>
  )
}

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="landing-section-title">
      <span className="landing-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

function Services() {
  return (
    <section className="landing-section" id="servicios">
      <CContainer>
        <SectionTitle eyebrow="Servicios" title="Mimos durante toda la estancia" text="Agrégalos desde tu cuenta mientras tu mascota está con nosotros." />
        <CRow className="g-4">
          {SERVICES.map((service) => (
            <CCol key={service.title} md={4}>
              <div className="landing-card landing-service" style={{ '--accent': service.color }}>
                <span className="landing-service-icon">
                  <CIcon icon={service.icon} size="xl" />
                </span>
                <h3>{service.title}</h3>
                <p className="mb-0">{service.text}</p>
              </div>
            </CCol>
          ))}
        </CRow>
      </CContainer>
    </section>
  )
}

function Rooms() {
  return (
    <section className="landing-section landing-section-alt" id="habitaciones">
      <CContainer>
        <SectionTitle eyebrow="Habitaciones" title="Un rincón a su medida" text="Cada sede tiene habitaciones pensadas para perros y para gatos." />
        <CRow className="g-4 align-items-stretch">
          {ROOMS.map((room) => (
            <CCol key={room.name} md={4}>
              <div className={`landing-card landing-room ${room.featured ? 'landing-room-featured' : ''}`}>
                {room.featured && <span className="landing-ribbon">Favorita</span>}
                <span className="landing-room-species">{room.species}</span>
                <h3>{room.name}</h3>
                <div className="landing-room-price">{room.price}</div>
                <p>{room.text}</p>
                <ul className="list-unstyled mb-4">
                  {room.features.map((feature) => (
                    <li key={feature.label} className="d-flex align-items-center gap-2 mb-2">
                      <CIcon icon={feature.icon} className="text-primary" />
                      {feature.label}
                    </li>
                  ))}
                </ul>
                <CButton color="primary" variant={room.featured ? undefined : 'outline'} as={Link} to="/registro" className="mt-auto">
                  Reservar
                </CButton>
              </div>
            </CCol>
          ))}
        </CRow>
      </CContainer>
    </section>
  )
}

function Steps() {
  return (
    <section className="landing-section" id="como-funciona">
      <CContainer>
        <SectionTitle eyebrow="Cómo funciona" title="De tu casa a la nuestra en 4 pasos" />
        <CRow className="g-4">
          {STEPS.map((step, index) => (
            <CCol key={step.title} sm={6} lg={3}>
              <div className="landing-step">
                <span className="landing-step-number">{index + 1}</span>
                <span className="landing-icon-bubble">
                  <CIcon icon={step.icon} size="lg" />
                </span>
                <h3>{step.title}</h3>
                <p className="mb-0">{step.text}</p>
              </div>
            </CCol>
          ))}
        </CRow>
      </CContainer>
    </section>
  )
}

function Faq() {
  return (
    <section className="landing-section landing-section-alt" id="preguntas">
      <CContainer>
        <CRow className="g-5">
          <CCol lg={4}>
            <SectionTitle eyebrow="Preguntas frecuentes" title="¿Tienes dudas?" text="Estas son las que más nos hacen. Si no encuentras la tuya, escríbenos." />
          </CCol>
          <CCol lg={8}>
            <CAccordion className="landing-faq" activeItemKey={0}>
              {FAQ.map((item, index) => (
                <CAccordionItem key={item.question} itemKey={index}>
                  <CAccordionHeader>{item.question}</CAccordionHeader>
                  <CAccordionBody>{item.answer}</CAccordionBody>
                </CAccordionItem>
              ))}
            </CAccordion>
          </CCol>
        </CRow>
      </CContainer>
    </section>
  )
}

function CallToAction() {
  return (
    <section className="landing-section pt-0">
      <CContainer>
        <div className="landing-cta">
          <div>
            <h2>¿Listos para su próxima aventura?</h2>
            <p className="mb-0">
              <CIcon icon={cilCheckCircle} className="me-2" />
              Crear tu cuenta es gratis y solo toma un minuto.
            </p>
          </div>
          <CButton color="light" size="lg" as={Link} to="/registro" className="landing-cta-button">
            Crear mi cuenta
          </CButton>
        </div>
      </CContainer>
    </section>
  )
}

function Footer() {
  return (
    <footer className="landing-footer">
      <CContainer>
        <CRow className="g-4 align-items-center">
          <CCol md={4}>
            <img src={logoHorizontal} alt="Guau & Miau Club" height={48} className="landing-footer-logo" />
          </CCol>
          <CCol md={8}>
            <ul className="list-unstyled d-flex flex-wrap gap-4 justify-content-md-end mb-0">
              {CONTACT.items.map((item) => (
                <li key={item.label} className="d-flex align-items-center gap-2">
                  <CIcon icon={item.icon} />
                  {item.label}
                </li>
              ))}
            </ul>
          </CCol>
        </CRow>
        <div className="landing-footer-bottom">© {new Date().getFullYear()} Guau & Miau Club · Hotel de mascotas</div>
      </CContainer>
    </footer>
  )
}

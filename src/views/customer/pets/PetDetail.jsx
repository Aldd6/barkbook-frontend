import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CButton, CCard, CCardBody, CCardHeader, CCol, CNav, CNavItem, CNavLink, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDescription, cilPaw, cilPencil } from '@coreui/icons'
import useAuth from '../../../auth/useAuth'
import useApiQuery from '../../../hooks/useApiQuery'
import PageHeader from '../../../components/PageHeader'
import QueryState from '../../../components/QueryState'
import FileUpload from '../../../components/FileUpload'
import DietsTab from './DietsTab'
import SanityTab from './SanityTab'
import VaccinesTab from './VaccinesTab'
import {
  getPet,
  removePetProfilePicture,
  removePetVaccinationCard,
  updatePetProfilePicture,
  updatePetVaccinationCard,
} from '../../../api/pets'
import { DOCUMENT_TYPES } from '../../../api/files'
import { PERMISSIONS } from '../../../constants/permissions'
import { PET_SIZE_LABELS, PET_SPECIES_LABELS, SEX_LABELS, UNIT_MEASURE_WEIGHT_PET_LABELS } from '../../../constants/enums'
import { formatAge, formatDate, yesNo } from '../../../utils/format'

const TABS = [
  { key: 'diets', label: 'Dietas', Component: DietsTab },
  { key: 'sanity', label: 'Enfermedades', Component: SanityTab },
  { key: 'vaccines', label: 'Vacunas', Component: VaccinesTab },
]

export default function PetDetail() {
  const { id } = useParams()
  const { hasPermission } = useAuth()
  const canManage = hasPermission(PERMISSIONS.GESTIONAR_MASCOTAS)
  const pet = useApiQuery(useCallback(() => getPet(id), [id]))
  const [activeTab, setActiveTab] = useState(TABS[0].key)
  const ActiveTab = TABS.find((tab) => tab.key === activeTab).Component

  return (
    <QueryState query={pet}>
      {pet.data && (
        <>
          <PageHeader
            title={pet.data.name}
            subtitle="Expediente de la mascota"
            actions={
              <>
                <CButton color="secondary" variant="ghost" as={Link} to="/mascotas">
                  Volver
                </CButton>
                {canManage && (
                  <CButton color="primary" variant="outline" as={Link} to={`/mascotas/${id}/editar`}>
                    <CIcon icon={cilPencil} className="me-1" />
                    Editar datos
                  </CButton>
                )}
              </>
            }
          />
          <CCard className="mb-4">
            <CCardBody>
              <CRow className="g-4">
                <CCol xs={12} sm={6} lg={3}>
                  <div className="small text-body-secondary mb-1">Foto</div>
                  <FileUpload
                    url={pet.data.profilePicture}
                    canEdit={canManage}
                    icon={cilPaw}
                    emptyLabel="Sin foto"
                    onUpload={(file) => updatePetProfilePicture(id, file)}
                    onRemove={() => removePetProfilePicture(id)}
                    onChanged={pet.reload}
                  />
                </CCol>
                <CCol xs={12} lg={6}>
                  <CRow className="g-3">
                    <Info label="Especie" value={PET_SPECIES_LABELS[pet.data.species]} />
                    <Info label="Sexo" value={SEX_LABELS[pet.data.sex]} />
                    <Info label="Tamaño" value={PET_SIZE_LABELS[pet.data.size]} />
                    <Info label="Nacimiento" value={`${formatDate(pet.data.birthday)} (${formatAge(pet.data.birthday)})`} />
                    <Info label="Peso" value={`${pet.data.actualWeight} ${UNIT_MEASURE_WEIGHT_PET_LABELS[pet.data.unitOfMeasureWeight]?.toLowerCase()}`} />
                    <Info label="Sociabilidad" value={`${pet.data.sociabilityLevel} de 5`} />
                    <Info label="Esterilizado(a)" value={yesNo(pet.data.isNeutered)} />
                  </CRow>
                </CCol>
                <CCol xs={12} sm={6} lg={3}>
                  <div className="small text-body-secondary mb-1">Carné de vacunación</div>
                  <FileUpload
                    url={pet.data.vaccinationCard}
                    types={DOCUMENT_TYPES}
                    canEdit={canManage}
                    icon={cilDescription}
                    emptyLabel="Sin carné"
                    onUpload={(file) => updatePetVaccinationCard(id, file)}
                    onRemove={() => removePetVaccinationCard(id)}
                    onChanged={pet.reload}
                  />
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
          <CCard>
            <CCardHeader>
              <CNav variant="underline-border" className="card-header-tabs">
                {TABS.map((tab) => (
                  <CNavItem key={tab.key}>
                    <CNavLink as="button" type="button" active={tab.key === activeTab} onClick={() => setActiveTab(tab.key)}>
                      {tab.label}
                    </CNavLink>
                  </CNavItem>
                ))}
              </CNav>
            </CCardHeader>
            <CCardBody>
              <ActiveTab key={activeTab} petId={id} canManage={canManage} />
            </CCardBody>
          </CCard>
        </>
      )}
    </QueryState>
  )
}

function Info({ label, value }) {
  return (
    <CCol xs={6} md={4} lg={6} xl={4}>
      <div className="small text-body-secondary">{label}</div>
      <div className="fw-semibold">{value}</div>
    </CCol>
  )
}

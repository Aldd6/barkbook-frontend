import client from './client'

// Catalogos publicos de direccion.
export const getStates = () => client.get('/address/states').then((r) => r.data.states)

export const getCities = (stateId) => client.get(`/address/states/${stateId}/cities`).then((r) => r.data.cities)

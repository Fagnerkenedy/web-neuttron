import React, { createContext, useContext, useState, useEffect } from 'react';
import { createContextualCan } from '@casl/react';
import { defineAbilitiesFor } from './abilities.js';
import { fetchPermissions } from './authService.js'

const AbilityContext = createContext();
const Can = createContextualCan(AbilityContext.Consumer)

export const AbilityProvider = ({ children }) => {
    const [ability, setAbility] = useState(defineAbilitiesFor([]))
    const [loading, setLoading] = useState(true);

    const updateAbility = async () => {
        const permissions = await fetchPermissions()
        setAbility(defineAbilitiesFor(permissions.permissions[0]))
        setLoading(false);
    };

    useEffect(() => {
        updateAbility();
    }, []);

    return (
        <AbilityContext.Provider value={{ ability, updateAbility, loading, Can }}>
            {children}
        </AbilityContext.Provider>
    );
};

export const useAbility = () => useContext(AbilityContext)
export { Can }

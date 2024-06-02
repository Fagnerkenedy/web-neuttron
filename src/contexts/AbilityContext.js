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
        console.log("permissions",permissions.permissions[0])
        setAbility(defineAbilitiesFor(permissions.permissions[0]))
        console.log("abilities",ability)
        setLoading(false);
    };

    useEffect(() => {
        console.log("useefect updateAbility")
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

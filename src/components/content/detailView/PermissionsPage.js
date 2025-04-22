import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Checkbox, Typography, Spin, Switch, message } from 'antd';
import { createPermissions, createProfilesPermissions, deleteProfilesPermissions, fetchModules, fetchPermissions } from './fetchModules';

const { Title, Text } = Typography;

function PermissionRow({ module, permissions, setPermissions, profileId, handlePermissionUpdate }) {
    const handlePermissionChange = async (moduleApiName, permissionType) => {
        const wasChecked = permissions[moduleApiName][permissionType].checked;
        const permissionId = permissions[moduleApiName][permissionType].id;

        // Update state immediately for UI responsiveness
        setPermissions(prevPermissions => ({
            ...prevPermissions,
            [moduleApiName]: {
                ...prevPermissions[moduleApiName],
                [permissionType]: {
                    checked: !wasChecked,
                    id: permissionId
                }
            }
        }));

        // Call the API to update the backend
        await handlePermissionUpdate(profileId, moduleApiName, permissionType, !wasChecked, permissionId);
    };

    const handleToggleAll = async (moduleApiName) => {
        const currentStatus = Object.values(permissions[moduleApiName]).some(status => status.checked);
        const newStatus = !currentStatus;

        // Update state immediately for UI responsiveness
        setPermissions(prevPermissions => ({
            ...prevPermissions,
            [moduleApiName]: {
                read: { checked: newStatus, id: permissions[moduleApiName].read.id },
                create: { checked: newStatus, id: permissions[moduleApiName].create.id },
                update: { checked: newStatus, id: permissions[moduleApiName].update.id },
                delete: { checked: newStatus, id: permissions[moduleApiName].delete.id }
            }
        }));

        // Call the API to update the backend
        await Promise.all([
            handlePermissionUpdate(profileId, moduleApiName, 'read', newStatus, permissions[moduleApiName].read.id),
            handlePermissionUpdate(profileId, moduleApiName, 'create', newStatus, permissions[moduleApiName].create.id),
            handlePermissionUpdate(profileId, moduleApiName, 'update', newStatus, permissions[moduleApiName].update.id),
            handlePermissionUpdate(profileId, moduleApiName, 'delete', newStatus, permissions[moduleApiName].delete.id)
        ]);
    };

    return (
        <Row style={{ marginBottom: '10px' }}>
            <Col span={5}>
                <Switch
                    style={{ marginRight: '10px' }}
                    checked={Object.values(permissions[module.api_name]).every(status => status.checked)}
                    onChange={() => handleToggleAll(module.api_name)}
                />
                {(() => {
                    if (module.name == 'users') {
                        return (
                            <Text><b>Usuários</b></Text>
                        )
                    } else if (module.name == 'functions') {
                        return (
                            <Text><b>Funções</b></Text>
                        )
                    } else if (module.name == 'charts') {
                        return (
                            <Text><b>Gráficos</b></Text>
                        )
                    } else {
                        return (
                            <Text><b>{module.name}</b></Text>
                        )
                    }
                })()}
                {/* <Text><b>{module.name === 'users' ? 'Usuários' : module.name}</b></Text> */}
            </Col>
            <Col span={6}>
                <Checkbox
                    checked={permissions[module.api_name].read.checked}
                    onChange={() => handlePermissionChange(module.api_name, 'read')}
                >
                    Visualizar
                </Checkbox>
            </Col>
            <Col span={4}>
                <Checkbox
                    checked={permissions[module.api_name].create.checked}
                    onChange={() => handlePermissionChange(module.api_name, 'create')}
                >
                    Criar
                </Checkbox>
            </Col>
            <Col span={4}>
                <Checkbox
                    checked={permissions[module.api_name].update.checked}
                    onChange={() => handlePermissionChange(module.api_name, 'update')}
                >
                    Editar
                </Checkbox>
            </Col>
            <Col span={5}>
                <Checkbox
                    checked={permissions[module.api_name].delete.checked}
                    onChange={() => handlePermissionChange(module.api_name, 'delete')}
                >
                    Deletar
                </Checkbox>
            </Col>
        </Row>
    );
}

function PermissionsPage() {
    const [modules, setModules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const org = pathParts[1];
    const profileId = pathParts[3];

    useEffect(() => {
        async function fetchModulesData() {
            const fetchedModules = await fetchModules(org);
            setModules(fetchedModules.result);

            // Fetch permissions from database
            const dbPermissions = await fetchPermissionsFromDatabase(profileId);
            const initialPermissions = transformDatabasePermissionsToBoolean(dbPermissions);

            // Initialize permissions if not already in the database
            fetchedModules.result.forEach(module => {
                if (!initialPermissions[module.api_name]) {
                    initialPermissions[module.api_name] = {
                        read: { checked: false, id: null },
                        create: { checked: false, id: null },
                        update: { checked: false, id: null },
                        delete: { checked: false, id: null }
                    };
                }
            });

            // Ensure 'users' module is included
            if (!initialPermissions['users']) {
                initialPermissions['users'] = {
                    read: { checked: false, id: null },
                    create: { checked: false, id: null },
                    update: { checked: false, id: null },
                    delete: { checked: false, id: null }
                };
            }
            if (!initialPermissions['functions']) {
                initialPermissions['functions'] = {
                    read: { checked: false, id: null },
                    create: { checked: false, id: null },
                    update: { checked: false, id: null },
                    delete: { checked: false, id: null }
                };
            }
            if (!initialPermissions['charts']) {
                initialPermissions['charts'] = {
                    read: { checked: false, id: null },
                    create: { checked: false, id: null },
                    update: { checked: false, id: null },
                    delete: { checked: false, id: null }
                };
            }
            setPermissions(initialPermissions);
            setLoading(false);
        }
        fetchModulesData();
    }, []);

    async function fetchPermissionsFromDatabase(profileId) {
        try {
            const response = await fetchPermissions(org, profileId);
            return response;
        } catch (error) {
            console.error('Erro ao buscar permissões:', error);
            throw error;
        }
    }

    function transformDatabasePermissionsToBoolean(permissions) {
        const permissionsObject = {};

        permissions.forEach(permission => {
            const { id, action, subject } = permission;
            if (!permissionsObject[subject]) {
                permissionsObject[subject] = {
                    read: { checked: false, id: null },
                    create: { checked: false, id: null },
                    update: { checked: false, id: null },
                    delete: { checked: false, id: null }
                };
            }
            permissionsObject[subject][action] = { checked: true, id };
        });
        return permissionsObject;
    }

    async function savePermission(action, subject) {
        try {
            const permissionsBody = { action, subject };
            const response = await createPermissions(org, permissionsBody);
            return response.insertId;
        } catch (error) {
            console.error('Error saving permission:', error);
            throw error;
        }
    }

    async function linkPermissionToProfile(profileId, permissionId) {
        try {
            const response = await createProfilesPermissions(org, { id_profile: profileId, id_permission: permissionId });
            return response;
        } catch (error) {
            console.error('Error linking permission to profile:', error);
            throw error;
        }
    }

    async function unlinkPermissionFromProfile(profileId, permissionId, action, subject) {
        try {
            const response = await deleteProfilesPermissions(org, profileId, permissionId);
            if (!response.success) {
                throw new Error('Erro ao desvincular permissão');
            }
            return response;
        } catch (error) {
            console.error('Erro ao desvincular permissão:', error);
            throw error;
        }
    }

    async function handlePermissionUpdate(profileId, moduleApiName, action, newStatus, permissionId) {
        if (newStatus) {
            // If the permission is being checked, create it if necessary and link it
            if (!permissionId) {
                permissionId = await savePermission(action, moduleApiName);
            }
            await linkPermissionToProfile(profileId, permissionId);
            message.success('Permissão Atualizada!');
        } else {
            // If the permission is being unchecked, unlink it
            await unlinkPermissionFromProfile(profileId, permissionId, action, moduleApiName);
            message.success('Permissão Atualizada!');
        }
    }

    if (loading) {
        return (
            <Layout style={{ padding: '15px 25px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </Layout>
        );
    }

    return (
        <Col>
            <Title level={3}>Gerenciamento de Permissões</Title>
            <Row>
                <Col span={5}><Text><b>Módulo</b></Text></Col>
                <Col span={6}><Text><b>Visualizar</b></Text></Col>
                <Col span={4}><Text><b>Criar</b></Text></Col>
                <Col span={4}><Text><b>Editar</b></Text></Col>
                <Col span={5}><Text><b>Deletar</b></Text></Col>
            </Row>
            <PermissionRow
                key="users"
                module={{ name: 'users', api_name: 'users' }}
                permissions={permissions}
                setPermissions={setPermissions}
                profileId={profileId}
                handlePermissionUpdate={handlePermissionUpdate}
            />
            <PermissionRow
                key="functions"
                module={{ name: 'functions', api_name: 'functions' }}
                permissions={permissions}
                setPermissions={setPermissions}
                profileId={profileId}
                handlePermissionUpdate={handlePermissionUpdate}
            />
            <PermissionRow
                key="charts"
                module={{ name: 'charts', api_name: 'charts' }}
                permissions={permissions}
                setPermissions={setPermissions}
                profileId={profileId}
                handlePermissionUpdate={handlePermissionUpdate}
            />
            {modules.map((module) => (
                <PermissionRow
                    key={module.api_name}
                    module={module}
                    permissions={permissions}
                    setPermissions={setPermissions}
                    profileId={profileId}
                    handlePermissionUpdate={handlePermissionUpdate}
                />
            ))}
        </Col>
    );
}

export default PermissionsPage;

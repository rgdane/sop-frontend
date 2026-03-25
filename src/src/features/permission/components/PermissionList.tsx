"use client";

import { useEffect, useMemo, useState } from "react";
import { usePermissionActions } from "../hook/usePermission";
import { useRoleAction } from "@/features/role/hook/useRole";
import Select from "@/components/ui/Select";
import { Role } from "@/types/data/role.types";
import { Permission } from "@/types/data/permission.types";
import { LockOutlined } from "@ant-design/icons";
import { Checkbox, Switch, Row, Col, Button, Input } from "antd";
import { Wrapper } from "@/components/fragments/Wrapper";
import Loading from "@/app/loading";

interface PermissionModule {
  module: string;
  permissions: (Permission & { granted: boolean })[];
}

type PermissionWithGranted = Permission & {
  granted: boolean;
};

export default function PermissionList() {
  const { fetchPermissions } = usePermissionActions();
  const { roles, updateRole } = useRoleAction();
  const [permissions, setPermissions] = useState<PermissionWithGranted[]>([]);
  const [pendingPermissions, setPendingPermissions] = useState<
    PermissionWithGranted[]
  >([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // --- FUNGSI DIDEKLARASI AWAL ---
  const handleRoleChange = (value: string) => {
    setSelectedRoleId(value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getPermissionAction = (permissionName: string) => {
    const parts = permissionName.split(".");
    return parts.length > 1 ? parts.slice(1).join(".") : permissionName;
  };

  const formatModuleName = (moduleName: string) => {
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  };

  const getPermissionsByAction = (permissionsList: PermissionWithGranted[]) => {
    const actions: { [key: string]: PermissionWithGranted } = {};
    permissionsList.forEach((permission) => {
      const action = getPermissionAction(permission.name);
      actions[action] = permission;
    });
    return actions;
  };

  const formatActionName = (action: string) => {
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleGrantAll = (moduleData: PermissionModule, checked: boolean) => {
    setPendingPermissions((prev) =>
      prev.map((p) =>
        p.name.startsWith(`${moduleData.module}.`)
          ? { ...p, granted: checked }
          : p
      )
    );
  };

  const handlePermissionChange = (
    permission: PermissionWithGranted,
    checked: boolean
  ) => {
    setPendingPermissions((prev) =>
      prev.map((p) =>
        p.name === permission.name ? { ...p, granted: checked } : p
      )
    );
  };



  const loadPermissions = async (roleId: string) => {
    try {
      setLoading(true);
      const permissionDatas = await fetchPermissions({
        preload: true,
      });

      const withGranted: PermissionWithGranted[] = permissionDatas.map((p) => ({
        ...p,
        granted: p.has_role.some((r) => r.id === Number(roleId)),
      }));

      setPermissions(withGranted);
      setPendingPermissions(JSON.parse(JSON.stringify(withGranted)));
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (selectedRoleId) {
      loadPermissions(selectedRoleId);
    } else {
      setPermissions([]);
      setPendingPermissions([]);
    }
  }, [selectedRoleId]);

  const roleOptions = useMemo(() => {
    return roles.map((role) => ({
      label: role.name,
      value: role.id,
    }));
  }, [roles]);

  const permissionModules = useMemo(() => {
    const modules: { [key: string]: PermissionWithGranted[] } = {};

    pendingPermissions.forEach((permission) => {
      const parts = permission.name.split(".");
      if (parts.length >= 2) {
        const module = parts[0];
        if (!modules[module]) {
          modules[module] = [];
        }
        modules[module].push(permission);
      }
    });

    return Object.keys(modules).map((module) => ({
      module,
      permissions: modules[module].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [pendingPermissions]);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) {
      return permissionModules;
    }

    const query = searchQuery.toLowerCase();

    return permissionModules
      .filter((moduleData) => {
        const moduleMatches = moduleData.module.toLowerCase().includes(query);
        const permissionMatches = moduleData.permissions.some((permission) => {
          const action = getPermissionAction(permission.name);
          const formattedAction = formatActionName(action);
          return formattedAction.toLowerCase().includes(query);
        });

        return moduleMatches || permissionMatches;
      })
      .map((moduleData) => {
        if (moduleData.module.toLowerCase().includes(query)) {
          return moduleData;
        }

        const filteredPermissions = moduleData.permissions.filter(
          (permission) => {
            const action = getPermissionAction(permission.name);
            const formattedAction = formatActionName(action);
            return formattedAction.toLowerCase().includes(query);
          }
        );

        return {
          ...moduleData,
          permissions: filteredPermissions,
        };
      });
  }, [permissionModules, searchQuery]);

  const isDirty = useMemo(() => {
    return permissions.some(
      (p, idx) => p.granted !== pendingPermissions[idx]?.granted
    );
  }, [permissions, pendingPermissions]);

  const handleSave = async () => {
    const payload = {
      role_has_permissions: pendingPermissions
        .filter((p) => p.granted)
        .map((p) => p.id),
    };
    await updateRole(Number(selectedRoleId), payload);
    setPermissions(JSON.parse(JSON.stringify(pendingPermissions)));
  };

  return (
    <div className="flex flex-col gap-y-6 mt-6">
      <div className="flex justify-between mt-6">
        <div className="">
          <div className="w-[20rem]">
            <Select
              showSearch
              options={roleOptions}
              placeholder="Pilih role"
              onChange={handleRoleChange}
              value={selectedRoleId}
              notFoundContent="Tidak ditemukan"
              filterOption={(input, option) => {
                const label = option?.label;
                if (typeof label === "string") {
                  return label.toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            />
          </div>
        </div>
        {selectedRoleId && (
          <div className="flex lg:flex-row flex-col gap-x-4">
            <Input.Search
              placeholder="Cari module atau permission"
              value={searchQuery}
              onChange={handleSearchChange}
              allowClear
              style={{ width: 300 }}
            />
            <Button type="primary" onClick={handleSave} disabled={!isDirty}>
              Save Permissions
            </Button>
          </div>
        )}
      </div>

      <Wrapper
        title="Permission"
        description="Atur permission untuk role yang dipilih"
        icon={<LockOutlined />}
      >
        {selectedRoleId ? (
          loading ? (
            <Loading isFullScreen={false} />
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-8 ">
              {searchQuery
                ? `No permissions found matching "${searchQuery}"`
                : "No permissions found for this role"}
            </div>
          ) : (
            <>
              {searchQuery && (
                <div className="mb-4 text-sm ">
                  Showing {filteredModules.length} of {permissionModules.length}{" "}
                  modules
                </div>
              )}

              <Row gutter={[24, 24]}>
                {filteredModules.map((moduleData) => {
                  const modulePermissions = getPermissionsByAction(
                    moduleData.permissions
                  );
                  const grantedCount = moduleData.permissions.filter(
                    (p) => p.granted
                  ).length;
                  const totalCount = moduleData.permissions.length;
                  const isAllGranted =
                    grantedCount === totalCount && totalCount > 0;

                  return (
                    <Col xs={24} md={12} lg={8} key={moduleData.module}>
                      <div className="relative border border-gray-200 dark:border-[#454545] rounded-lg">
                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 px-3 bg-white dark:bg-[#242424] text-sm font-medium">
                          {formatModuleName(moduleData.module)}
                        </div>

                        <div className="p-4 pt-6">
                          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-[#454545]">
                            <span className="text-sm font-medium">
                              Grant All
                            </span>
                            <Switch
                              checked={isAllGranted}
                              onChange={(checked) =>
                                handleGrantAll(moduleData, checked)
                              }
                              checkedChildren="ON"
                              unCheckedChildren="OFF"
                            />
                          </div>

                          <div className="space-y-3">
                            {Object.entries(modulePermissions).map(
                              ([action, permission]) => {
                                const formattedAction =
                                  formatActionName(action);
                                const isHighlighted =
                                  searchQuery &&
                                  formattedAction
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase());

                                return (
                                  <div
                                    key={action}
                                    className="flex items-center"
                                  >
                                    <Checkbox
                                      checked={permission.granted}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          permission,
                                          e.target.checked
                                        )
                                      }
                                    >
                                      <span
                                        className={`text-sm ${
                                          isHighlighted
                                            ? "bg-yellow-200 dark:bg-yellow-800"
                                            : ""
                                        }`}
                                      >
                                        {formattedAction}
                                      </span>
                                    </Checkbox>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#454545]">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {grantedCount} of {totalCount} permissions granted
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </>
          )
        ) : (
          <div className="text-center py-12 dark:text-gray-200">
            <LockOutlined className="text-4xl mb-4" />
            <div>Silahkan Pilih Role Dahulu</div>
          </div>
        )}
        {}
      </Wrapper>
    </div>
  );
}

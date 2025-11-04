export const User_RolesEnum ={
    ADMIN : "admin",
    PROJECT_ADMIN :"project_admin",
    MEMEBER  : "memeber"


}
export const AvailableUserRole= Object.values(User_RolesEnum)

export const TaskStatusEnum ={
    TODO : "todo",
    IN_PROGRESS :"in_progress",
    DONE :"done",
}
export const AvailableTaskStatusEnum = Object.values(TaskStatusEnum)
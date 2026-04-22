import axiosInstance from "@/config/axios";

// Interface kembalian dari backend seeder (sesuai JSON fiber.Map yang kita buat)
export interface SeederResponse {
  success: boolean;
  message: string;
  data: any;
}

export const seederService = {
  seedMasterData: () => 
    axiosInstance.post<{ data: SeederResponse }>('/seeders/master-data'),
  
  seedParentData: () => 
    axiosInstance.post<{ data: SeederResponse }>('/seeders/parent-data'),
  
  seedJobData: () => 
    axiosInstance.post<{ data: SeederResponse }>('/seeders/job-data'),
};
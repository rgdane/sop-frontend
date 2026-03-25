interface Option {
  name: string;
  id: number;
}

export const getOptionsById = <T extends Option>(Id: number, model: T[]) => {
  const option = model.find((data) => data.id === Id);
  return option ? option.name : `-`;
};

export const getOptions = <T extends Option>(model: T[]) =>
  model.map((data) => ({ label: data.name, value: data.id }));
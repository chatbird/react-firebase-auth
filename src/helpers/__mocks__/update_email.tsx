const funcWithPromiseReturnValue = () => jest.fn().mockReturnValue(new Promise((resolve) => resolve()));
const updateEmail = funcWithPromiseReturnValue();
export default updateEmail;
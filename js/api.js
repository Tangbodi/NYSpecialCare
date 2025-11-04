import axios from 'axios';

export const sendIntakeForm = async (formData) => {
    try {
        const response = await axios.post('/api/send-intake-form', formData);
        return {
            success: true,
            message: response.data.message || 'Form sent successfully!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send form.',
        };
    }
};


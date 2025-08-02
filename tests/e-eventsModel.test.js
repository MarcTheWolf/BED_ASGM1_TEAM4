const eventModel = require('../Models/eventModel.js');
const sql = require('mssql');

jest.mock('mssql');

describe('eventModel', () => {
    let mockRequest, mockConnection;

    beforeEach(() => {
        mockRequest = {
            input: jest.fn().mockReturnThis(),
            query: jest.fn()
        };
        mockConnection = {
            request: jest.fn(() => mockRequest),
            close: jest.fn()
        };
        sql.connect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getEventRegisteredByID', () => {
        it('should return registered events for a user', async () => {
            const fakeEvents = [{ id: 1, name: 'Test Event' }];
            mockRequest.query.mockResolvedValue({ recordset: fakeEvents });

            const result = await eventModel.getEventRegisteredByID(123);
            expect(sql.connect).toHaveBeenCalled();
            expect(mockRequest.input).toHaveBeenCalledWith('account_id', expect.anything(), 123);
            expect(result).toEqual(fakeEvents);
        });

        it('should throw error on query failure', async () => {
            mockRequest.query.mockRejectedValue(new Error('DB error'));
            await expect(eventModel.getEventRegisteredByID(1)).rejects.toThrow('DB error');
        });
    });

    describe('getEventDetailsByID', () => {
        it('should return event details by ID', async () => {
            const fakeEvent = { id: 2, name: 'Event 2' };
            mockRequest.query.mockResolvedValue({ recordset: [fakeEvent] });

            const result = await eventModel.getEventDetailsByID(2);
            expect(mockRequest.input).toHaveBeenCalledWith('id', expect.anything(), 2);
            expect(result).toEqual(fakeEvent);
        });

        it('should return undefined if no event found', async () => {
            mockRequest.query.mockResolvedValue({ recordset: [] });
            const result = await eventModel.getEventDetailsByID(999);
            expect(result).toBeUndefined();
        });
    });

    describe('getAllEvents', () => {
        it('should return all upcoming events', async () => {
            const fakeEvents = [{ id: 1 }, { id: 2 }];
            mockRequest.query.mockResolvedValue({ recordset: fakeEvents });

            const result = await eventModel.getAllEvents();
            expect(result).toEqual(fakeEvents);
        });
    });

    describe('registerEvent', () => {
        it('should register event if not already registered', async () => {
            mockRequest.query
                .mockResolvedValueOnce({ recordset: [] }) // not registered
                .mockResolvedValueOnce({ rowsAffected: [1] }); // insert success

            const result = await eventModel.registerEvent(1, 2);
            expect(result).toBe(true);
        });

        it('should not register if already registered', async () => {
            mockRequest.query.mockResolvedValueOnce({ recordset: [{}] }); // already registered
            const result = await eventModel.registerEvent(1, 2);
            expect(result).toBe(false);
        });
    });

    describe('unregisterEvent', () => {
        it('should unregister event', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
            const result = await eventModel.unregisterEvent(1, 2);
            expect(result).toBe(true);
        });

        it('should return false if nothing deleted', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [0] });
            const result = await eventModel.unregisterEvent(1, 2);
            expect(result).toBe(false);
        });
    });

    describe('createEvent', () => {
        it('should create event and return true', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
            const eventData = {
                name: 'New Event',
                description: 'desc',
                date: new Date(),
                time: '10:00',
                location: 'Room 1',
                org_id: 1,
                weekly: false,
                equipment_required: null,
                banner_image: ''
            };
            const result = await eventModel.createEvent(eventData);
            expect(result).toBe(true);
        });

        it('should throw error on failure', async () => {
            mockRequest.query.mockRejectedValue(new Error('Insert error'));
            await expect(eventModel.createEvent({})).rejects.toThrow('Insert error');
        });
    });

    describe('updateEvent', () => {
        it('should update event and return true', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [1] });
            const eventData = {
                name: 'Updated',
                description: 'desc',
                date: new Date(),
                time: '12:00',
                location: 'Room 2',
                weekly: true,
                equipment_required: 'None',
                banner_image: ''
            };
            const result = await eventModel.updateEvent(1, eventData, 1);
            expect(result).toBe(true);
        });

        it('should return false if no rows affected', async () => {
            mockRequest.query.mockResolvedValue({ rowsAffected: [0] });
            const result = await eventModel.updateEvent(1, {}, 1);
            expect(result).toBe(false);
        });
    });

    describe('deleteEvent', () => {
        it('should delete event and return true', async () => {
            // First query for RegisteredList, second for EventList
            mockRequest.query
                .mockResolvedValueOnce({}) // RegisteredList delete
                .mockResolvedValueOnce({ rowsAffected: [1] }); // EventList delete

            const result = await eventModel.deleteEvent(1, 1);
            expect(result).toBe(true);
        });

        it('should return false if event not deleted', async () => {
            mockRequest.query
                .mockResolvedValueOnce({}) // RegisteredList delete
                .mockResolvedValueOnce({ rowsAffected: [0] }); // EventList delete

            const result = await eventModel.deleteEvent(1, 1);
            expect(result).toBe(false);
        });
    });
});
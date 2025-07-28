import React, { useEffect, useState } from 'react';
import { roadmapsAPI } from '../utils/api';
import { Map, Plus, Calendar, CheckCircle, Book } from 'lucide-react';

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoadmaps();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const response = await roadmapsAPI.getAll();
      setRoadmaps(response.data);
      
      // Seed predefined roadmaps if none exist
      if (response.data.length === 0) {
        await roadmapsAPI.seedPredefined();
        const newResponse = await roadmapsAPI.getAll();
        setRoadmaps(newResponse.data);
      }
    } catch (error) {
      console.error('Error loading roadmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMilestones = async (roadmapId) => {
    try {
      const response = await roadmapsAPI.getMilestones(roadmapId);
      setMilestones(response.data);
    } catch (error) {
      console.error('Error loading milestones:', error);
    }
  };

  const selectRoadmap = (roadmap) => {
    setSelectedRoadmap(roadmap);
    loadMilestones(roadmap.id);
  };

  const completeMilestone = async (milestoneId) => {
    try {
      await roadmapsAPI.completeMilestone(milestoneId);
      loadMilestones(selectedRoadmap.id);
    } catch (error) {
      console.error('Error completing milestone:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Learning Roadmaps</h1>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Roadmap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roadmaps List */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Available Roadmaps</h2>
            <div className="space-y-3">
              {roadmaps.map((roadmap) => (
                <RoadmapCard
                  key={roadmap.id}
                  roadmap={roadmap}
                  isSelected={selectedRoadmap?.id === roadmap.id}
                  onSelect={() => selectRoadmap(roadmap)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Roadmap Details */}
        <div className="lg:col-span-2">
          {selectedRoadmap ? (
            <div className="card">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">
                    {selectedRoadmap.title}
                  </h2>
                  <p className="text-secondary-600 mt-1">
                    {selectedRoadmap.description}
                  </p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="badge badge-primary">
                      {selectedRoadmap.category}
                    </span>
                    {selectedRoadmap.is_predefined && (
                      <span className="badge badge-secondary">Predefined</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-secondary-900">Milestones</h3>
                {milestones.length === 0 ? (
                  <p className="text-secondary-500 text-center py-8">
                    No milestones found for this roadmap.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {milestones.map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        onComplete={() => completeMilestone(milestone.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <Map className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">
                  Select a Roadmap
                </h3>
                <p className="text-secondary-500">
                  Choose a learning roadmap to view its milestones and track your progress.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border transition-colors ${
        isSelected
          ? 'border-primary-300 bg-primary-50'
          : 'border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-secondary-900">{roadmap.title}</h3>
          <p className="text-sm text-secondary-500 mt-1 line-clamp-2">
            {roadmap.description}
          </p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-xs text-secondary-500">{roadmap.category}</span>
            {roadmap.is_predefined && (
              <span className="text-xs text-primary-600">Predefined</span>
            )}
          </div>
        </div>
        <Book className="h-5 w-5 text-secondary-400 flex-shrink-0 ml-2" />
      </div>
    </button>
  );
}

function MilestoneCard({ milestone, onComplete }) {
  return (
    <div className={`p-4 border rounded-lg ${
      milestone.is_completed 
        ? 'border-success-200 bg-success-50' 
        : 'border-secondary-200 bg-white'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                milestone.is_completed
                  ? 'border-success-500 bg-success-500'
                  : 'border-secondary-300'
              }`}>
                {milestone.is_completed && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="ml-3 text-sm font-medium text-secondary-600">
                Day {milestone.day}
              </span>
            </div>
          </div>
          
          <h4 className={`text-lg font-medium mt-2 ${
            milestone.is_completed ? 'text-success-900' : 'text-secondary-900'
          }`}>
            {milestone.title}
          </h4>
          
          {milestone.description && (
            <p className="text-secondary-600 mt-1">{milestone.description}</p>
          )}
        </div>

        {!milestone.is_completed && (
          <button
            onClick={onComplete}
            className="btn btn-sm btn-primary ml-4"
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}

export default Roadmaps;
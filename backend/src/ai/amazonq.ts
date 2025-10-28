import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export interface TaskGenerationRequest {
  category?: string;
  difficulty?: string;
  userPreferences?: any;
}

export const generateTasksWithAI = async (request: TaskGenerationRequest) => {
  const prompt = createPrompt(request);
  
  try {
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    return parseAIResponse(responseBody.content[0].text);
  } catch (error) {
    console.error('Amazon Q/Bedrock error:', error);
    // Fallback to mock tasks if AI fails
    return getMockTasks(request);
  }
};

const createPrompt = (request: TaskGenerationRequest): string => {
  const { category, difficulty } = request;
  
  return `Generate 3 micro-tasks for a mobile app where users earn money by completing simple activities. 

Requirements:
- Category: ${category || 'mixed (surveys, videos, apps, social media, reviews)'}
- Difficulty: ${difficulty || 'mixed'}
- Each task should take 2-15 minutes
- Rewards should be realistic ($0.25 - $2.00)
- Tasks should be engaging and achievable

For each task, provide:
1. Title (concise, action-oriented)
2. Description (clear instructions)
3. Category (surveys, videos, apps, social, reviews)
4. Reward amount (in dollars)
5. Estimated time

Format as JSON array:
[
  {
    "title": "Task title",
    "description": "Task description",
    "category": "category",
    "reward": 0.50,
    "estimatedTime": "5 minutes"
  }
]

Focus on tasks that are:
- Legal and ethical
- Easy to verify completion
- Engaging for users
- Suitable for mobile devices`;
};

const parseAIResponse = (aiText: string) => {
  try {
    // Extract JSON from AI response
    const jsonMatch = aiText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const tasks = JSON.parse(jsonMatch[0]);
      return tasks.map((task: any) => ({
        ...task,
        reward: Math.round(task.reward * 100) // Convert to cents for consistency
      }));
    }
  } catch (error) {
    console.error('Error parsing AI response:', error);
  }
  
  // Fallback if parsing fails
  return getMockTasks();
};

const getMockTasks = (request?: TaskGenerationRequest) => {
  const allTasks = [
    {
      title: 'Complete Daily Survey',
      description: 'Answer 10 questions about your shopping preferences',
      category: 'surveys',
      reward: 50,
      estimatedTime: '5 minutes',
    },
    {
      title: 'Watch Product Video',
      description: 'Watch a 2-minute video about eco-friendly products',
      category: 'videos',
      reward: 25,
      estimatedTime: '3 minutes',
    },
    {
      title: 'Rate Mobile App',
      description: 'Download and rate a productivity app on the app store',
      category: 'apps',
      reward: 100,
      estimatedTime: '10 minutes',
    },
    {
      title: 'Social Media Engagement',
      description: 'Follow and like 5 posts from sponsored accounts',
      category: 'social',
      reward: 30,
      estimatedTime: '5 minutes',
    },
    {
      title: 'Product Review',
      description: 'Write a detailed review for a product you recently purchased',
      category: 'reviews',
      reward: 150,
      estimatedTime: '15 minutes',
    },
  ];

  let filteredTasks = allTasks;
  
  if (request?.category && request.category !== 'mixed') {
    filteredTasks = allTasks.filter(task => task.category === request.category);
  }
  
  if (request?.difficulty) {
    filteredTasks = filteredTasks.filter(task => {
      if (request.difficulty === 'easy') return task.reward <= 50;
      if (request.difficulty === 'medium') return task.reward > 50 && task.reward <= 100;
      if (request.difficulty === 'hard') return task.reward > 100;
      return true;
    });
  }

  return filteredTasks.sort(() => 0.5 - Math.random()).slice(0, 3);
};